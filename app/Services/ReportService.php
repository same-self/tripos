<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Setting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Numbers for the admin Dashboard (Desain Visual 4.1). Read-only: it never changes data.
 *
 * Money is returned as whole rupiah integers and formatted by the screen, except the two
 * recommendation cards, whose sentences are built here because they mix names and amounts.
 */
class ReportService
{
    /** Carbon dayOfWeek: 0 = Sunday. */
    private const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    /**
     * @return array{
     *   period: int,
     *   window_days: int,
     *   kpis: array<string, int|float|null>,
     *   daily: list<array{date: string, label: string, income: int}>,
     *   recent: list<array<string, mixed>>,
     *   recommendations: list<array{tag: string, tone: string, title: string, text: string}>
     * }
     */
    public function dashboard(int $days = 30, ?Carbon $now = null): array
    {
        $now = ($now ?? now())->copy();
        $days = max(1, $days);

        $end = $now->copy()->endOfDay();
        $start = $now->copy()->startOfDay()->subDays($days - 1);
        $previousEnd = $start->copy()->subSecond();
        $previousStart = $start->copy()->subDays($days);

        [$income, $transactions] = $this->salesTotals($start, $end);
        [$previousIncome, $previousTransactions] = $this->salesTotals($previousStart, $previousEnd);
        $purchases = $this->purchaseTotal($start, $end);

        $window = max(1, Setting::int('report_window_days', 30));

        return [
            'period' => $days,
            'window_days' => $window,
            'kpis' => [
                'income' => $income,
                'income_change' => $this->change($income, $previousIncome),
                'transactions' => $transactions,
                'transactions_change' => $this->change($transactions, $previousTransactions),
                'purchases' => $purchases,
                'net_cash_flow' => $income - $purchases,
            ],
            'daily' => $this->dailyIncome($start, $end, $days),
            'recent' => $this->recentSales($now),
            'recommendations' => $this->recommendations($now, $window),
        ];
    }

    /** @return array{0: int, 1: int} [income, number of sales] */
    private function salesTotals(Carbon $from, Carbon $to): array
    {
        $row = Sale::query()
            ->whereBetween('transacted_at', [$from, $to])
            ->selectRaw('COALESCE(SUM(total_price), 0) as income, COUNT(*) as transactions')
            ->first();

        return [(int) $row->income, (int) $row->transactions];
    }

    private function purchaseTotal(Carbon $from, Carbon $to): int
    {
        return (int) Purchase::query()->whereBetween('transacted_at', [$from, $to])->sum('total_price');
    }

    /** Percent change against the previous period, or null when there is nothing to compare with. */
    private function change(int $current, int $previous): ?float
    {
        if ($previous === 0) {
            return null;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    /**
     * One entry per day, oldest first, days without sales included as 0.
     * Grouping is done in PHP so it behaves the same on MySQL and SQLite.
     *
     * @return list<array{date: string, label: string, income: int}>
     */
    private function dailyIncome(Carbon $start, Carbon $end, int $days): array
    {
        $perDay = Sale::query()
            ->whereBetween('transacted_at', [$start, $end])
            ->get(['total_price', 'transacted_at'])
            ->groupBy(fn (Sale $sale) => $sale->transacted_at->toDateString())
            ->map(fn (Collection $sales) => (int) $sales->sum('total_price'));

        $series = [];

        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i);

            $series[] = [
                'date' => $day->toDateString(),
                // 7 days: weekday names (Sen, Sel, ...). Longer ranges: day/month.
                'label' => $days <= 7 ? self::DAY_LABELS[$day->dayOfWeek] : $day->format('j/n'),
                'income' => $perDay->get($day->toDateString(), 0),
            ];
        }

        return $series;
    }

    /** @return list<array<string, mixed>> the 5 latest sales, newest first */
    private function recentSales(Carbon $now): array
    {
        return Sale::query()
            ->with(['user' => fn ($query) => $query->withTrashed(), 'payment'])
            ->orderByDesc('transacted_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (Sale $sale) => [
                'id' => $sale->id,
                'receipt_number' => $sale->receipt_number,
                'cashier' => $sale->user?->name ?? 'Kasir',
                'time' => $sale->transacted_at->isSameDay($now)
                    ? $sale->transacted_at->format('H:i')
                    : $sale->transacted_at->format('d/m H:i'),
                'method' => $sale->payment?->payment_method->label(),
                'amount' => (int) $sale->total_price,
            ])
            ->all();
    }

    /**
     * Two rule-based cards (no machine learning, so the owner can see why something is flagged):
     *  - "Untung terbesar": the item with the highest profit in the window (items only,
     *    because services have no cost price).
     *  - "Modal mengendap": items in stock that sold fewer than the "slow" threshold in the window.
     *
     * @return list<array{tag: string, tone: string, title: string, text: string}>
     */
    private function recommendations(Carbon $now, int $window): array
    {
        $windowStart = $now->copy()->startOfDay()->subDays($window - 1);
        $windowEnd = $now->copy()->endOfDay();

        $sold = DB::table('item_details as d')
            ->join('sales_transactions as s', 's.id', '=', 'd.sales_id')
            ->whereNull('d.deleted_at')
            ->whereNull('s.deleted_at')
            ->whereBetween('s.transacted_at', [$windowStart, $windowEnd])
            ->get(['d.item_id', 'd.amount', 'd.sell_price', 'd.cost_price'])
            ->groupBy('item_id')
            ->map(fn (Collection $rows) => [
                'quantity' => (int) $rows->sum('amount'),
                // PHP integers, so a sale below cost price gives a negative profit instead of a database error.
                'profit' => (int) $rows->sum(fn ($row) => ((int) $row->sell_price - (int) $row->cost_price) * (int) $row->amount),
            ]);

        $cards = [];

        if ($top = $this->topProfitCard($sold, $window)) {
            $cards[] = $top;
        }

        if ($idle = $this->idleCapitalCard($sold)) {
            $cards[] = $idle;
        }

        return $cards;
    }

    /** @param  Collection<int|string, array{quantity: int, profit: int}>  $sold */
    private function topProfitCard(Collection $sold, int $window): ?array
    {
        $best = $sold->sortByDesc('profit')->first();

        if (! $best || $best['profit'] <= 0) {
            return null;
        }

        $itemId = $sold->sortByDesc('profit')->keys()->first();
        $item = Item::withTrashed()->find($itemId);

        if (! $item) {
            return null;
        }

        return [
            'tag' => 'Untung terbesar',
            'tone' => 'primary',
            'title' => $item->name,
            'text' => 'Sekitar '.$this->rupiah((int) round($best['profit'], -3))." keuntungan dalam {$window} hari.",
        ];
    }

    /** @param  Collection<int|string, array{quantity: int, profit: int}>  $sold */
    private function idleCapitalCard(Collection $sold): ?array
    {
        $slowBelow = Setting::int('slow_moving_threshold', 10);

        $idle = Item::query()
            ->where('stock', '>', 0)
            ->where('cost_price', '>', 0)
            ->get(['id', 'name', 'stock', 'cost_price'])
            ->filter(fn (Item $item) => ($sold->get($item->id)['quantity'] ?? 0) < $slowBelow)
            ->map(fn (Item $item) => ['name' => $item->name, 'capital' => (int) $item->stock * (int) $item->cost_price])
            ->sortByDesc('capital')
            ->values();

        if ($idle->isEmpty()) {
            return null;
        }

        $names = $this->joinNames($idle->take(3)->pluck('name')->all());

        if ($idle->count() > 3) {
            $names .= ' dan lainnya';
        }

        return [
            'tag' => 'Modal mengendap',
            'tone' => 'danger',
            'title' => $this->rupiah((int) $idle->sum('capital')).' tertahan di '.$idle->count().' barang',
            'text' => $names.' jarang terjual.',
        ];
    }

    /** @param  list<string>  $names */
    private function joinNames(array $names): string
    {
        return match (count($names)) {
            1 => $names[0],
            2 => $names[0].' dan '.$names[1],
            default => implode(', ', array_slice($names, 0, -1)).', dan '.end($names),
        };
    }

    private function rupiah(int $amount): string
    {
        return 'Rp '.number_format($amount, 0, ',', '.');
    }
}
