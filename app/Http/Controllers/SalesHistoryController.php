<?php

namespace App\Http\Controllers;

use App\Models\Sale;
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
        $sale->load([
            'user' => fn ($q) => $q->withTrashed(),
            'payment',
            'itemDetails.item',
            'serviceDetails.service',
        ]);

        // Prices are the ones stored with the sale, so an old receipt never changes
        $items = $sale->itemDetails->map(fn ($d) => [
            'name' => $d->item->name,
            'detail' => $d->amount.' × '.number_format($d->sell_price, 0, ',', '.'),
            'subtotal' => (int) $d->subtotal,
        ]);

        $services = $sale->serviceDetails->map(fn ($d) => [
            'name' => $d->service->name,
            'detail' => $d->amount.' '.$d->service->unit.' × '.number_format($d->unit_price, 0, ',', '.'),
            'subtotal' => (int) $d->subtotal,
        ]);

        $payment = $sale->payment;

        return Inertia::render('Riwayat/Show', [
            'receipt' => [
                'number' => $sale->receipt_number ?? '#'.$sale->id,
                'date' => $sale->transacted_at->format('d/m/Y H:i'),
                'cashier' => $sale->user?->name ?? 'Kasir',
                'lines' => $items->concat($services)->values(),
                'total' => (int) $sale->total_price,
                'method' => $payment?->payment_method?->label(),
                'amount_paid' => (int) ($payment?->amount_paid ?? 0),
                'change' => (int) ($payment?->change_amount ?? 0),
                'is_cash' => $payment?->payment_method?->value === 'cash',
            ],
        ]);
    }
}