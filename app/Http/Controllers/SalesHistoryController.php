<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Support\Receipt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesHistoryController extends Controller
{
    private const PERIODS = ['hari', 'minggu', 'semua'];

    public function index(Request $request): Response
    {
        $period = $request->query('periode');
        $period = in_array($period, self::PERIODS, true) ? $period : 'minggu';
        $search = trim((string) $request->query('cari', ''));

        // The same filter is used for the totals and for the list, so they always agree
        $filter = function ($query) use ($period, $search) {
            return $query
                ->when($period === 'hari', fn ($q) => $q->whereDate('transacted_at', today()))
                ->when($period === 'minggu', fn ($q) => $q->whereBetween('transacted_at', [now()->startOfWeek(), now()->endOfDay()]))
                ->when($search !== '', fn ($q) => $q->where('receipt_number', 'like', '%'.$search.'%'));
        };

        $totals = Sale::query()->tap($filter)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as total')
            ->first();

        $sales = Sale::query()
            ->with(['user' => fn ($q) => $q->withTrashed(), 'payment', 'itemDetails', 'serviceDetails'])
            ->tap($filter)
            ->orderByDesc('transacted_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Sale $sale) => [
                'id' => $sale->id,
                'receipt' => $sale->receipt_number ?? '#'.$sale->id,
                'time' => $sale->transacted_at->format('d/m/Y H:i'),
                'cashier' => $sale->user?->name ?? 'Kasir',
                'method' => $sale->payment?->payment_method->label() ?? '-',
                'method_value' => $sale->payment?->payment_method->value,
                'items' => $sale->itemDetails->count() + $sale->serviceDetails->count(),
                'total' => (int) $sale->total_price,
            ]);

        return Inertia::render('Riwayat/Index', [
            'sales' => $sales,
            'filters' => ['periode' => $period, 'cari' => $search],
            'totals' => ['count' => (int) $totals->count, 'total' => (int) $totals->total],
        ]);
    }

    public function show(Sale $sale): Response
    {
        return Inertia::render('Riwayat/Show', [
            'receipt' => Receipt::for($sale),
        ]);
    }
}