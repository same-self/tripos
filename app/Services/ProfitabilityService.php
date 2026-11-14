<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Service;
use App\Models\ServiceMaterial;
use App\Models\Setting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Ranks everything that was sold (items AND services) by profit, and says in plain
 * words which ones earn well and which ones do not. Read-only: it never changes data.
 *
 * This is rule-based on purpose (no machine learning), so the owner can always see why
 * something is flagged. The rules, in this order:
 *
 *   rugi      profit is below zero (sold for less than it cost)
 *   tipis     profit is zero, or the margin is under the "thin margin" setting
 *   unggulan  one of the 3 biggest profits
 *   sehat     everything else
 *
 * Money:
 *  - An item's cost is the cost price saved WITH each sale, so restocking at a new price
 *    never rewrites the profit of sales that already happened.
 *  - A service has no cost price of its own. Its cost is ESTIMATED from the materials set on
 *    the service (quantity used per unit x the material's cost price). Ink, electricity and
 *    labour are not counted, so a service's real profit is somewhat lower than shown.
 *
 * Sums are done in PHP, not SQL, so a loss never hits MySQL's unsigned-subtraction error
 * and the result is the same on MySQL and SQLite.
 */
class ProfitabilityService
{
    /** How many of the biggest earners get the "unggulan" label. */
    private const TOP = 3;

    /**
     * @return array{
     *   window: int,
     *   thin_margin: int,
     *   rows: list<array<string, mixed>>,
     *   summary: array<string, mixed>
     * }
     */
    public function ranking(int $days = 30, ?Carbon $now = null): array
    {
        $now = ($now ?? now())->copy();
        $days = max(1, $days);

        $start = $now->copy()->startOfDay()->subDays($days - 1);
        $end = $now->copy()->endOfDay();
        $thin = max(0, Setting::int('thin_margin_percent', 15));

        $rows = $this->itemRows($start, $end)
            ->concat($this->serviceRows($start, $end))
            ->sortByDesc('profit')
            ->values()
            ->map(fn (array $row, int $index) => $this->judge($row, $index, $thin))
            ->all();

        return [
            'window' => $days,
            'thin_margin' => $thin,
            'rows' => $rows,
            'summary' => $this->summary($rows),
        ];
    }

    /** @return Collection<int, array<string, mixed>> */
    private function itemRows(Carbon $start, Carbon $end): Collection
    {
        $sold = DB::table('item_details as d')
            ->join('sales_transactions as s', 's.id', '=', 'd.sales_id')
            ->whereNull('d.deleted_at')
            ->whereNull('s.deleted_at')
            ->whereBetween('s.transacted_at', [$start, $end])
            ->get(['d.item_id', 'd.amount', 'd.subtotal', 'd.cost_price'])
            ->groupBy('item_id');

        $items = Item::withTrashed()->whereIn('id', $sold->keys())->get()->keyBy('id');

        return $sold->map(function (Collection $lines, $itemId) use ($items) {
            $item = $items->get($itemId);

            return $this->row(
                kind: 'barang',
                id: (int) $itemId,
                name: $item?->name ?? 'Barang dihapus',
                unit: $item?->unit ?? '',
                quantity: (int) $lines->sum('amount'),
                revenue: (int) $lines->sum('subtotal'),
                // Cost price as it was on the day of each sale
                cost: (int) $lines->sum(fn ($line) => (int) $line->amount * (int) $line->cost_price),
                estimated: false,
            );
        })->values();
    }

    /** @return Collection<int, array<string, mixed>> */
    private function serviceRows(Carbon $start, Carbon $end): Collection
    {
        $sold = DB::table('service_details as d')
            ->join('sales_transactions as s', 's.id', '=', 'd.sales_id')
            ->whereNull('d.deleted_at')
            ->whereNull('s.deleted_at')
            ->whereBetween('s.transacted_at', [$start, $end])
            ->get(['d.service_id', 'd.amount', 'd.subtotal'])
            ->groupBy('service_id');

        if ($sold->isEmpty()) {
            return collect();
        }

        $services = Service::withTrashed()->whereIn('id', $sold->keys())->get()->keyBy('id');
        $materialCost = $this->materialCostPerUnit($sold->keys()->all());

        return $sold->map(function (Collection $lines, $serviceId) use ($services, $materialCost) {
            $service = $services->get($serviceId);
            $quantity = (int) $lines->sum('amount');

            return $this->row(
                kind: 'jasa',
                id: (int) $serviceId,
                name: $service?->name ?? 'Layanan dihapus',
                unit: $service?->unit ?? '',
                quantity: $quantity,
                revenue: (int) $lines->sum('subtotal'),
                cost: (int) round($quantity * ($materialCost[$serviceId] ?? 0)),
                estimated: true,
            );
        })->values();
    }

    /**
     * Material cost of ONE unit of each service (for example one sheet), in rupiah.
     *
     * @param  list<int|string>  $serviceIds
     * @return array<int|string, float>
     */
    private function materialCostPerUnit(array $serviceIds): array
    {
        $materials = ServiceMaterial::whereIn('service_id', $serviceIds)->get(['service_id', 'item_id', 'quantity_used_per_unit']);
        $costs = Item::withTrashed()->whereIn('id', $materials->pluck('item_id')->unique())->pluck('cost_price', 'id');

        return $materials
            ->groupBy('service_id')
            ->map(fn (Collection $rows) => (float) $rows->sum(
                fn ($row) => (float) $row->quantity_used_per_unit * (int) ($costs[$row->item_id] ?? 0)
            ))
            ->all();
    }

    /** @return array<string, mixed> */
    private function row(string $kind, int $id, string $name, string $unit, int $quantity, int $revenue, int $cost, bool $estimated): array
    {
        $profit = $revenue - $cost;

        return [
            'kind' => $kind,
            'key' => $kind.'-'.$id,
            'name' => $name,
            'unit' => $unit,
            'sold' => $quantity,
            'revenue' => $revenue,
            'cost' => $cost,
            'profit' => $profit,
            // Share of the sales amount that is profit. null when nothing was charged.
            'margin' => $revenue > 0 ? round($profit / $revenue * 100, 1) : null,
            'estimated' => $estimated,
        ];
    }

    /**
     * Adds the rank, the verdict and a one-line reason the owner can read.
     *
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function judge(array $row, int $index, int $thin): array
    {
        $margin = $row['margin'];

        if ($row['profit'] < 0) {
            $verdict = 'rugi';
            $reason = 'Dijual di bawah modal, rugi '.$this->rupiah(-$row['profit']).'.';
        } elseif ($row['profit'] === 0 || ($margin !== null && $margin < $thin)) {
            $verdict = 'tipis';
            $reason = $margin === null
                ? 'Tidak ada untung dari penjualan ini.'
                : 'Untung hanya '.$this->percent($margin).' dari penjualan (batas '.$thin.'%).';
        } elseif ($index < self::TOP) {
            $verdict = 'unggulan';
            $reason = 'Termasuk '.self::TOP.' besar keuntungan, untung '.$this->percent($margin).'.';
        } else {
            $verdict = 'sehat';
            $reason = 'Untung '.$this->percent($margin).' dari penjualan.';
        }

        return $row + ['rank' => $index + 1, 'verdict' => $verdict, 'reason' => $reason];
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     * @return array<string, mixed>
     */
    private function summary(array $rows): array
    {
        $rows = collect($rows);

        return [
            'revenue' => (int) $rows->sum('revenue'),
            'profit' => (int) $rows->sum('profit'),
            'counts' => [
                'unggulan' => $rows->where('verdict', 'unggulan')->count(),
                'sehat' => $rows->where('verdict', 'sehat')->count(),
                'tipis' => $rows->where('verdict', 'tipis')->count(),
                'rugi' => $rows->where('verdict', 'rugi')->count(),
            ],
        ];
    }

    private function rupiah(int $amount): string
    {
        return 'Rp '.number_format($amount, 0, ',', '.');
    }

    private function percent(?float $value): string
    {
        // 25.0 -> "25%", 12.5 -> "12,5%"
        return rtrim(rtrim(number_format((float) $value, 1, ',', '.'), '0'), ',').'%';
    }
}
