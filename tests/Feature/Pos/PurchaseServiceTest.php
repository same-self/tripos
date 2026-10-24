<?php

namespace Tests\Feature\Pos;

use App\Exceptions\Pos\InvalidLineException;
use App\Models\Purchase;
use App\Models\StockMutation;
use App\Models\User;
use App\Services\PurchaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class PurchaseServiceTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private User $admin;

    private PurchaseService $purchases;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->makeAdmin();
        $this->purchases = app(PurchaseService::class);
    }

    public function test_restock_adds_stock_writes_an_in_mutation_and_updates_cost_price(): void
    {
        $supplier = $this->makeSupplier();
        $item = $this->makeItem(['stock' => 5, 'cost_price' => 1000]);

        $purchase = $this->purchases->create($this->admin, [
            'supplier_id' => $supplier->id,
            'invoice_number' => 'INV-001',
            'lines' => [['item_id' => $item->id, 'qty' => 100, 'purchase_price' => 1200]],
        ]);

        $this->assertEquals(120000, $purchase->total_price);
        $this->assertSame('INV-001', $purchase->invoice_number);
        $this->assertEquals(105, $item->fresh()->stock);
        $this->assertEquals(1200, $item->fresh()->cost_price);

        $mutation = StockMutation::firstOrFail();
        $this->assertSame('IN', $mutation->type->value);
        $this->assertSame('Purchase', $mutation->source);
        $this->assertEquals(100, $mutation->amount);
        $this->assertEquals(105, $mutation->balance_after);
    }

    public function test_unknown_supplier_is_rejected_and_nothing_is_written(): void
    {
        $item = $this->makeItem(['stock' => 5]);

        try {
            $this->purchases->create($this->admin, [
                'supplier_id' => 9999,
                'lines' => [['item_id' => $item->id, 'qty' => 10, 'purchase_price' => 100]],
            ]);
            $this->fail('Expected InvalidLineException.');
        } catch (InvalidLineException) {
            // expected
        }

        $this->assertSame(0, Purchase::count());
        $this->assertEquals(5, $item->fresh()->stock);
    }

    public function test_a_line_without_a_price_is_rejected(): void
    {
        $supplier = $this->makeSupplier();
        $item = $this->makeItem();

        $this->expectException(InvalidLineException::class);

        $this->purchases->create($this->admin, [
            'supplier_id' => $supplier->id,
            'lines' => [['item_id' => $item->id, 'qty' => 10]],
        ]);
    }
}
