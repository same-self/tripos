<?php

namespace App\Services;

use App\Exceptions\Pos\EmptyCartException;
use App\Exceptions\Pos\InvalidLineException;
use App\Models\Item;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Records a restock from a supplier and adds the stock, atomically.
 *
 * Input shape:
 *   [
 *     'supplier_id'    => 1,
 *     'invoice_number' => 'INV-123',            // optional
 *     'transacted_at'  => '2026-10-24',         // optional
 *     'lines'          => [['item_id' => 1, 'qty' => 500, 'purchase_price' => 280], ...],
 *   ]
 */
class PurchaseService
{
    public function __construct(private readonly StockService $stock)
    {
    }

    public function create(User $user, array $data): Purchase
    {
        $lines = $data['lines'] ?? [];

        if ($lines === []) {
            throw new EmptyCartException();
        }

        // Lines are NOT merged: the same item bought at two prices stays as two rows.
        $clean = [];
        foreach ($lines as $line) {
            $id = (int) ($line['item_id'] ?? 0);
            $qty = (int) ($line['qty'] ?? 0);
            $price = (int) ($line['purchase_price'] ?? -1);

            if ($id < 1 || $qty < 1 || $price < 0) {
                throw new InvalidLineException('Baris tidak valid: barang, jumlah, dan harga beli wajib diisi.');
            }

            $clean[] = ['item_id' => $id, 'qty' => $qty, 'purchase_price' => $price];
        }

        $transactedAt = isset($data['transacted_at']) ? Carbon::parse($data['transacted_at']) : now();

        return DB::transaction(function () use ($user, $data, $clean, $transactedAt) {
            $supplier = Supplier::query()->find((int) ($data['supplier_id'] ?? 0));
            if (! $supplier) {
                throw new InvalidLineException('Supplier tidak ditemukan.');
            }

            $itemIds = array_values(array_unique(array_column($clean, 'item_id')));
            sort($itemIds);

            $items = Item::query()->whereIn('id', $itemIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            foreach ($itemIds as $id) {
                if (! $items->has($id)) {
                    throw new InvalidLineException("Barang #{$id} tidak ditemukan atau sudah dihapus.");
                }
            }

            $total = 0;
            foreach ($clean as $line) {
                $total += $line['qty'] * $line['purchase_price'];
            }

            $purchase = Purchase::create([
                'user_id' => $user->id,
                'supplier_id' => $supplier->id,
                'invoice_number' => $data['invoice_number'] ?? null,
                'total_price' => $total,
                'transacted_at' => $transactedAt,
            ]);

            foreach ($clean as $line) {
                $item = $items[$line['item_id']];

                $purchase->details()->create([
                    'item_id' => $item->id,
                    'amount' => $line['qty'],
                    'purchase_price' => $line['purchase_price'],
                    'subtotal' => $line['qty'] * $line['purchase_price'],
                ]);

                $this->stock->increase($item, $line['qty'], 'Purchase', $purchase->id);

                // Latest purchase price becomes the item's cost price (used for profit reports).
                $item->cost_price = $line['purchase_price'];
                $item->save();
            }

            return $purchase->load(['details.item', 'supplier', 'user']);
        }, 3);
    }
}
