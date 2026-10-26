<?php

namespace App\Support;

use App\Models\Sale;

class Receipt
{
    public static function for(Sale $sale): array
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

        return [
            'number' => $sale->receipt_number ?? '#'.$sale->id,
            'date' => $sale->transacted_at->format('d/m/Y H:i'),
            'cashier' => $sale->user?->name ?? 'Kasir',
            'lines' => $items->concat($services)->values(),
            'total' => (int) $sale->total_price,
            'method' => $payment?->payment_method?->label(),
            'amount_paid' => (int) ($payment?->amount_paid ?? 0),
            'change' => (int) ($payment?->change_amount ?? 0),
            'is_cash' => $payment?->payment_method?->value === 'cash',
        ];
    }
}