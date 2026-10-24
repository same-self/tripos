<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Exceptions\Pos\EmptyCartException;
use App\Exceptions\Pos\InsufficientPaymentException;
use App\Exceptions\Pos\InvalidLineException;
use App\Models\Item;
use App\Models\Sale;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Creates one complete sale: header, lines, payment and stock movements,
 * all inside a single database transaction (all-or-nothing).
 *
 * Input shape:
 *   [
 *     'items'          => [['item_id' => 1, 'qty' => 2], ...],
 *     'services'       => [['service_id' => 3, 'qty' => 10], ...],
 *     'payment_method' => 'cash' | 'qris' | PaymentMethod,
 *     'amount_paid'    => 50000,            // cash only; ignored for QRIS
 *     'transacted_at'  => '2026-10-24 10:00' // optional, for entering paper notes later
 *   ]
 *
 * Prices are NEVER taken from the input: they are read from the database here,
 * so a tampered browser request cannot change what a customer pays.
 */
class SaleService
{
    public function __construct(private readonly StockService $stock)
    {
    }

    public function create(User $cashier, array $data): Sale
    {
        $itemLines = $this->mergeLines($data['items'] ?? [], 'item_id');
        $serviceLines = $this->mergeLines($data['services'] ?? [], 'service_id');

        if ($itemLines === [] && $serviceLines === []) {
            throw new EmptyCartException();
        }

        $method = $data['payment_method'] instanceof PaymentMethod
            ? $data['payment_method']
            : PaymentMethod::from((string) $data['payment_method']);

        $transactedAt = isset($data['transacted_at']) ? Carbon::parse($data['transacted_at']) : now();
        $amountPaidInput = (int) ($data['amount_paid'] ?? 0);

        // 3 attempts: MySQL may abort one of two clashing transactions (deadlock); Laravel retries it.
        return DB::transaction(function () use ($cashier, $itemLines, $serviceLines, $method, $transactedAt, $amountPaidInput) {
            $allowNegative = Setting::bool('allow_negative_stock', true);
            $autoDeduct = Setting::bool('auto_deduct_service_materials', true);

            // ---- 1. Load services and every item we may touch ---------------------------------
            $services = Service::with('materials')
                ->whereIn('id', array_keys($serviceLines))
                ->get()
                ->keyBy('id');

            foreach (array_keys($serviceLines) as $id) {
                if (! $services->has($id)) {
                    throw new InvalidLineException("Layanan #{$id} tidak ditemukan.");
                }
            }

            $itemIds = array_keys($itemLines);
            if ($autoDeduct) {
                foreach ($services as $service) {
                    foreach ($service->materials as $material) {
                        $itemIds[] = $material->item_id;
                    }
                }
            }
            $itemIds = array_values(array_unique($itemIds));
            sort($itemIds); // same lock order everywhere -> avoids deadlocks

            // lockForUpdate: a second cashier selling the same item waits until we commit.
            $items = $itemIds === []
                ? collect()
                : Item::query()->whereIn('id', $itemIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            foreach ($itemIds as $id) {
                if (! $items->has($id)) {
                    throw new InvalidLineException("Barang #{$id} tidak ditemukan atau sudah dihapus.");
                }
            }

            // ---- 2. Total, from DB prices -----------------------------------------------------
            $total = 0;
            foreach ($itemLines as $id => $qty) {
                $total += $items[$id]->sell_price * $qty;
            }
            foreach ($serviceLines as $id => $qty) {
                $total += $services[$id]->unit_price * $qty;
            }

            // ---- 3. Payment check (before anything is written) --------------------------------
            if ($method === PaymentMethod::Cash) {
                if ($amountPaidInput < $total) {
                    throw new InsufficientPaymentException($total - $amountPaidInput);
                }
                $amountPaid = $amountPaidInput;
            } else {
                $amountPaid = $total; // QRIS: exact amount, no change
            }

            // ---- 4. Write header + number -----------------------------------------------------
            $sale = Sale::create([
                'user_id' => $cashier->id,
                'total_price' => $total,
                'transacted_at' => $transactedAt,
            ]);
            $sale->update([
                'receipt_number' => sprintf('TRX-%s-%05d', $transactedAt->format('Ymd'), $sale->id),
            ]);

            // ---- 5. Item lines + stock out ----------------------------------------------------
            foreach ($itemLines as $id => $qty) {
                $item = $items[$id];

                $sale->itemDetails()->create([
                    'item_id' => $item->id,
                    'amount' => $qty,
                    'sell_price' => $item->sell_price,
                    'cost_price' => $item->cost_price,
                    'subtotal' => $item->sell_price * $qty,
                ]);

                $this->stock->decrease($item, $qty, 'Sales', $sale->id, null, $allowNegative);
            }

            // ---- 6. Service lines + material stock out ----------------------------------------
            foreach ($serviceLines as $id => $qty) {
                $service = $services[$id];

                $sale->serviceDetails()->create([
                    'service_id' => $service->id,
                    'amount' => $qty,
                    'unit_price' => $service->unit_price,
                    'subtotal' => $service->unit_price * $qty,
                ]);

                if (! $autoDeduct) {
                    continue;
                }

                foreach ($service->materials as $material) {
                    // Stock is a whole number, so a fractional use (e.g. 0.5 sheet x 5) rounds up.
                    $needed = (int) ceil((float) $material->quantity_used_per_unit * $qty);

                    if ($needed > 0) {
                        $this->stock->decrease(
                            $items[$material->item_id],
                            $needed,
                            'Service',
                            $sale->id,
                            "Bahan untuk {$service->name} x{$qty}",
                            $allowNegative,
                        );
                    }
                }
            }

            // ---- 7. Payment -------------------------------------------------------------------
            $sale->payment()->create([
                'payment_method' => $method,
                'amount_paid' => $amountPaid,
                'change_amount' => $amountPaid - $total,
            ]);

            return $sale->load(['itemDetails.item', 'serviceDetails.service', 'payment', 'user']);
        }, 3);
    }

    /**
     * Validates lines and merges duplicates (same item scanned twice -> one line, summed qty).
     *
     * @return array<int,int> id => qty
     */
    private function mergeLines(array $lines, string $key): array
    {
        $merged = [];

        foreach ($lines as $line) {
            $id = (int) ($line[$key] ?? 0);
            $qty = (int) ($line['qty'] ?? 0);

            if ($id < 1 || $qty < 1) {
                throw new InvalidLineException('Baris tidak valid: ID dan jumlah harus lebih dari 0.');
            }

            $merged[$id] = ($merged[$id] ?? 0) + $qty;
        }

        return $merged;
    }
}
