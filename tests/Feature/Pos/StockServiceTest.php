<?php

namespace Tests\Feature\Pos;

use App\Exceptions\Pos\InsufficientStockException;
use App\Models\StockMutation;
use App\Services\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class StockServiceTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    public function test_adjustment_can_be_negative_and_is_logged_with_a_note(): void
    {
        $item = $this->makeItem(['stock' => 10]);

        app(StockService::class)->adjust($item, -4, 'Stok opname: 4 rusak');

        $this->assertEquals(6, $item->fresh()->stock);

        $mutation = StockMutation::firstOrFail();
        $this->assertSame('ADJUSTMENT', $mutation->type->value);
        $this->assertEquals(-4, $mutation->amount);
        $this->assertEquals(6, $mutation->balance_after);
        $this->assertSame('Stok opname: 4 rusak', $mutation->note);
    }

    public function test_decrease_can_be_blocked_when_negative_stock_is_not_allowed(): void
    {
        $item = $this->makeItem(['stock' => 1]);

        $this->expectException(InsufficientStockException::class);

        app(StockService::class)->decrease($item, 2, 'Sales', null, null, allowNegative: false);
    }

    public function test_zero_or_negative_quantities_are_rejected(): void
    {
        $item = $this->makeItem(['stock' => 5]);

        $this->expectException(InvalidArgumentException::class);

        app(StockService::class)->increase($item, 0, 'Purchase');
    }

    public function test_item_is_low_stock_at_or_below_the_minimum(): void
    {
        $this->assertTrue($this->makeItem(['stock' => 2, 'min_stock' => 2])->isLowStock());
        $this->assertFalse($this->makeItem(['stock' => 3, 'min_stock' => 2])->isLowStock());
    }
}
