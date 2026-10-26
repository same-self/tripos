<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    private const TABS = ['penjualan', 'pembelian', 'arus-kas', 'terlaris', 'keuntungan'];

    public function index(Request $request): Response
    {
        $tab = in_array($request->query('tab'), self::TABS, true) ? $request->query('tab') : 'penjualan';
        $periode = (int) $request->query('periode') === 30 ? 30 : 7;

        $start = now()->startOfDay()->subDays($periode - 1);
        $end = now()->endOfDay();

        $props = [
            'tab' => $tab,
            'periode' => $periode,
            'window' => max(1, Setting::int('report_window_days', 30)),
        ];

        if ($tab === 'penjualan') {
            $props['penjualan'] = $this->penjualan($start, $end, $periode);
        }

        if ($tab === 'pembelian') {
            $props['pembelian'] = $this->pembelian($start, $end);
        }

        if ($tab === 'arus-kas') {
            $props['arusKas'] = $this->arusKas($start, $end, $periode);
        }

        return Inertia::render('Laporan/Index', $props);
    }

    private function penjualan(Carbon $start, Carbon $end, int $periode): array
    {
        $sales = Sale::with('payment')->whereBetween('transacted_at', [$start, $end])->get();

        // One row per day, newest first, days without sales included as zero
        $days = collect(range(0, $periode - 1))->map(function (int $i) use ($sales) {
            $day = now()->startOfDay()->subDays($i);
            $daySales = $sales->filter(fn (Sale $sale) => $sale->transacted_at->isSameDay($day));

            return [
                'label' => $day->copy()->locale('id')->translatedFormat('l, j M Y'),
                'count' => $daySales->count(),
                'tunai' => (int) $daySales->filter(fn ($s) => $s->payment?->payment_method?->value === 'cash')->sum('total_price'),
                'qris' => (int) $daySales->filter(fn ($s) => $s->payment?->payment_method?->value === 'qris')->sum('total_price'),
                'total' => (int) $daySales->sum('total_price'),
            ];
        })->values();

        $total = (int) $sales->sum('total_price');
        $count = $sales->count();

        return [
            'total' => $total,
            'count' => $count,
            'average' => $count > 0 ? (int) round($total / $count) : 0,
            'days' => $days,
            'daysTotal' => [
                'count' => $days->sum('count'),
                'tunai' => $days->sum('tunai'),
                'qris' => $days->sum('qris'),
                'total' => $days->sum('total'),
            ],
            'terlaris' => $this->terlaris(),
            'lambat' => $this->lambat(),
        ];
    }

    private function pembelian(Carbon $start, Carbon $end): array
    {
        $purchases = Purchase::with('supplier')->whereBetween('transacted_at', [$start, $end])->get();
        $total = (int) $purchases->sum('total_price');

        $suppliers = $purchases->groupBy('supplier_id')
            ->map(function (Collection $group) use ($total) {
                $sum = (int) $group->sum('total_price');

                return [
                    'name' => $group->first()->supplier?->name ?? '-',
                    'count' => $group->count(),
                    'total' => $sum,
                    'share' => $total > 0 ? round($sum / $total * 100, 1) : 0,
                ];
            })
            ->sortByDesc('total')
            ->values();

        return [
            'total' => $total,
            'count' => $purchases->count(),
            'supplierCount' => $purchases->pluck('supplier_id')->unique()->count(),
            'suppliers' => $suppliers,
        ];
    }

    private function arusKas(Carbon $start, Carbon $end, int $periode): array
    {
        $sales = Sale::whereBetween('transacted_at', [$start, $end])->get(['total_price', 'transacted_at']);
        $purchases = Purchase::whereBetween('transacted_at', [$start, $end])->get(['total_price', 'transacted_at']);

        $income = (int) $sales->sum('total_price');
        $spending = (int) $purchases->sum('total_price');

        // Weeks of 7 days, oldest first; the last week may be shorter
        $weeks = [];

        for ($offset = 0; $offset < $periode; $offset += 7) {
            $from = $start->copy()->addDays($offset)->startOfDay();
            $to = $start->copy()->addDays(min($offset + 6, $periode - 1))->endOfDay();

            $weekIncome = (int) $sales
                ->filter(fn ($s) => $s->transacted_at->between($from, $to))
                ->sum('total_price');

            $weekSpending = (int) $purchases
                ->filter(fn ($p) => Carbon::parse($p->transacted_at)->between($from, $to))
                ->sum('total_price');

            $weeks[] = [
                'label' => $from->copy()->locale('id')->translatedFormat('j M')
                    .' – '.$to->copy()->locale('id')->translatedFormat('j M'),
                'income' => $weekIncome,
                'spending' => $weekSpending,
                'net' => $weekIncome - $weekSpending,
            ];
        }

        return [
            'income' => $income,
            'spending' => $spending,
            'net' => $income - $spending,
            'weeks' => $weeks,
        ];
    }

    private function terlaris(): array
    {
        $fast = Setting::int('fast_moving_threshold', 80);
        $sold = $this->soldPerItem(max(1, Setting::int('report_window_days', 30)));

        return Item::whereIn('id', $sold->filter(fn ($qty) => $qty >= $fast)->keys())
            ->get(['id', 'name'])
            ->map(fn (Item $item) => ['name' => $item->name, 'sold' => (int) $sold[$item->id]])
            ->sortByDesc('sold')
            ->take(3)
            ->values()
            ->all();
    }

    private function lambat(): array
    {
        $slow = Setting::int('slow_moving_threshold', 10);
        $sold = $this->soldPerItem(max(1, Setting::int('report_window_days', 30)));

        return Item::orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Item $item) => ['name' => $item->name, 'sold' => (int) ($sold[$item->id] ?? 0)])
            ->filter(fn ($row) => $row['sold'] < $slow)
            ->sortBy('sold')
            ->take(3)
            ->values()
            ->all();
    }

    // Same measure as the Stok page: every stock movement out in the window
    private function soldPerItem(int $days): Collection
    {
        $start = now()->startOfDay()->subDays($days - 1);

        return DB::table('stock_mutations as m')
            ->where('m.type', 'OUT')
            ->whereBetween('m.created_at', [$start, now()->endOfDay()])
            ->groupBy('m.item_id')
            ->selectRaw('m.item_id, SUM(m.amount) as qty')
            ->pluck('qty', 'item_id');
    }
}