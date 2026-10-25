<?php

namespace App\Services;

use App\Enums\StockMutationType;
use App\Exceptions\Pos\InsufficientStockException;
use App\Models\Item;
use App\Models\StockMutation;
use InvalidArgumentException;

/**
 * The ONLY place that changes items.stock. Every change writes a stock_mutations row,
 * so the audit trail can never drift from the real number.
 *
 * Callers must pass an Item that was loaded with lockForUpdate() inside a DB transaction
 * (SaleService / PurchaseService do this). Re-using the same Item instance for repeated
 * changes in one transaction keeps the in-memory stock correct.
 */
class StockService
{
    public function increase(Item $item, int $qty, string $source, ?int $referenceId = null, ?string $note = null): StockMutation
    {
        $this->assertPositive($qty);

        $item->stock += $qty;
        $item->save();

        return $this->record($item, $qty, StockMutationType::In, $source, $referenceId, $note);
    }

    public function decrease(
        Item $item,
        int $qty,
        string $source,
        ?int $referenceId = null,
        ?string $note = null,
        bool $allowNegative = true,
    ): StockMutation {
        $this->assertPositive($qty);

        if (! $allowNegative && $item->stock < $qty) {
            throw new InsufficientStockException($item->name, (int) $item->stock, $qty);
        }

        $item->stock -= $qty;
        $item->save();

        return $this->record($item, $qty, StockMutationType::Out, $source, $referenceId, $note);
    }

    /** Stock-count correction. $delta may be negative. */
    public function adjust(Item $item, int $delta, string $note): StockMutation
    {
        if ($delta === 0) {
            throw new InvalidArgumentException('Selisih penyesuaian tidak boleh 0.');
        }

        $item->stock += $delta;
        $item->save();

        return $this->record($item, $delta, StockMutationType::Adjustment, 'Adjustment', null, $note);
    }

    private function record(Item $item, int $amount, StockMutationType $type, string $source, ?int $referenceId, ?string $note): StockMutation
    {
        return StockMutation::create([
            'item_id' => $item->id,
            'amount' => $amount,
            'source' => $source,
            'type' => $type,
            'reference_id' => $referenceId,
            'balance_after' => $item->stock,
            'note' => $note,
        ]);
    }

    private function assertPositive(int $qty): void
    {
        if ($qty < 1) {
            throw new InvalidArgumentException('Jumlah harus lebih dari 0.');
        }
    }
}
