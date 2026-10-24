<?php

namespace Tests\Feature\Pos;

use App\Exceptions\Pos\EmptyCartException;
use App\Exceptions\Pos\InsufficientPaymentException;
use App\Exceptions\Pos\InsufficientStockException;
use App\Models\ItemDetail;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\Setting;
use App\Models\StockMutation;
use App\Models\User;
use App\Services\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class SaleServiceTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private User $cashier;

    private SaleService $sales;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cashier = $this->makeCashier();
        $this->sales = app(SaleService::class);
    }

    public function test_cash_sale_reduces_stock_and_writes_an_out_mutation(): void
    {
        $item = $this->makeItem(['sell_price' => 2500, 'cost_price' => 1000, 'stock' => 10]);

        $sale = $this->sales->create($this->cashier, [
            'items' => [['item_id' => $item->id, 'qty' => 3]],
            'payment_method' => 'cash',
            'amount_paid' => 10000,
        ]);

        $this->assertEquals(7500, $sale->total_price);
        $this->assertStringStartsWith('TRX-', $sale->receipt_number);
        $this->assertEquals(10000, $sale->payment->amount_paid);
        $this->assertEquals(2500, $sale->payment->change_amount);
        $this->assertEquals(7, $item->fresh()->stock);

        $detail = ItemDetail::firstOrFail();
        $this->assertEquals(2500, $detail->sell_price);
        $this->assertEquals(1000, $detail->cost_price); // cost snapshot for profit reports
        $this->assertEquals(7500, $detail->subtotal);

        $mutation = StockMutation::firstOrFail();
        $this->assertEquals(3, $mutation->amount);
        $this->assertSame('Sales', $mutation->source);
        $this->assertSame('OUT', $mutation->type->value);
        $this->assertEquals(7, $mutation->balance_after);
        $this->assertEquals($sale->id, $mutation->reference_id);
    }

    public function test_price_sent_from_the_browser_is_ignored(): void
    {
        $item = $this->makeItem(['sell_price' => 2500, 'stock' => 10]);

        $sale = $this->sales->create($this->cashier, [
            'items' => [['item_id' => $item->id, 'qty' => 2, 'price' => 1]], // tampered price
            'payment_method' => 'cash',
            'amount_paid' => 5000,
        ]);

        $this->assertEquals(5000, $sale->total_price);
    }

    public function test_the_same_item_scanned_twice_becomes_one_line(): void
    {
        $item = $this->makeItem(['stock' => 10]);

        $this->sales->create($this->cashier, [
            'items' => [
                ['item_id' => $item->id, 'qty' => 2],
                ['item_id' => $item->id, 'qty' => 3],
            ],
            'payment_method' => 'qris',
        ]);

        $this->assertSame(1, ItemDetail::count());
        $this->assertEquals(5, ItemDetail::firstOrFail()->amount);
        $this->assertEquals(5, $item->fresh()->stock);
    }

    public function test_qris_is_an_exact_payment_with_no_change(): void
    {
        $item = $this->makeItem(['sell_price' => 2500, 'stock' => 10]);

        $sale = $this->sales->create($this->cashier, [
            'items' => [['item_id' => $item->id, 'qty' => 2]],
            'payment_method' => 'qris',
            'amount_paid' => 999999, // ignored for QRIS
        ]);

        $this->assertSame('qris', $sale->payment->payment_method->value);
        $this->assertEquals(5000, $sale->payment->amount_paid);
        $this->assertEquals(0, $sale->payment->change_amount);
    }

    public function test_short_cash_payment_is_rejected_and_nothing_is_written(): void
    {
        $item = $this->makeItem(['sell_price' => 2500, 'stock' => 10]);

        try {
            $this->sales->create($this->cashier, [
                'items' => [['item_id' => $item->id, 'qty' => 2]],
                'payment_method' => 'cash',
                'amount_paid' => 4000,
            ]);
            $this->fail('Expected InsufficientPaymentException.');
        } catch (InsufficientPaymentException $e) {
            $this->assertSame(1000, $e->shortfall);
        }

        $this->assertSame(0, Sale::count());
        $this->assertSame(0, Payment::count());
        $this->assertSame(0, StockMutation::count());
        $this->assertEquals(10, $item->fresh()->stock);
    }

    public function test_empty_cart_is_rejected(): void
    {
        $this->expectException(EmptyCartException::class);

        $this->sales->create($this->cashier, [
            'items' => [],
            'services' => [],
            'payment_method' => 'cash',
            'amount_paid' => 0,
        ]);
    }

    public function test_stock_may_go_negative_by_default_so_the_queue_never_stops(): void
    {
        $item = $this->makeItem(['stock' => 1]);

        $this->sales->create($this->cashier, [
            'items' => [['item_id' => $item->id, 'qty' => 3]],
            'payment_method' => 'qris',
        ]);

        $this->assertEquals(-2, $item->fresh()->stock);
    }

    public function test_a_failing_line_rolls_back_the_whole_sale(): void
    {
        Setting::put('allow_negative_stock', false);

        $plenty = $this->makeItem(['stock' => 10]);
        $scarce = $this->makeItem(['stock' => 1]);

        // $plenty is written first, then $scarce fails: $plenty must be restored.
        try {
            $this->sales->create($this->cashier, [
                'items' => [
                    ['item_id' => $plenty->id, 'qty' => 2],
                    ['item_id' => $scarce->id, 'qty' => 5],
                ],
                'payment_method' => 'qris',
            ]);
            $this->fail('Expected InsufficientStockException.');
        } catch (InsufficientStockException) {
            // expected
        }

        $this->assertSame(0, Sale::count());
        $this->assertSame(0, ItemDetail::count());
        $this->assertSame(0, StockMutation::count());
        $this->assertEquals(10, $plenty->fresh()->stock);
        $this->assertEquals(1, $scarce->fresh()->stock);
    }

    public function test_photocopy_service_deducts_paper_automatically(): void
    {
        $paper = $this->makeItem(['stock' => 100, 'sell_price' => 500]);
        $copy = $this->makeService(['unit_price' => 300]);
        $this->attachMaterial($copy, $paper, 1);

        $sale = $this->sales->create($this->cashier, [
            'services' => [['service_id' => $copy->id, 'qty' => 10]],
            'payment_method' => 'cash',
            'amount_paid' => 5000,
        ]);

        $this->assertEquals(3000, $sale->total_price);
        $this->assertEquals(2000, $sale->payment->change_amount);
        $this->assertEquals(90, $paper->fresh()->stock);

        $mutation = StockMutation::firstOrFail();
        $this->assertSame('Service', $mutation->source);
        $this->assertEquals(10, $mutation->amount);
    }

    public function test_fractional_material_use_is_rounded_up_to_whole_units(): void
    {
        $paper = $this->makeItem(['stock' => 100]);
        $copy = $this->makeService(['unit_price' => 300]);
        $this->attachMaterial($copy, $paper, 0.5); // half a sheet per unit

        $this->sales->create($this->cashier, [
            'services' => [['service_id' => $copy->id, 'qty' => 5]], // 2.5 sheets -> 3
            'payment_method' => 'qris',
        ]);

        $this->assertEquals(97, $paper->fresh()->stock);
    }

    public function test_material_stock_is_untouched_when_auto_deduct_is_off(): void
    {
        Setting::put('auto_deduct_service_materials', false);

        $paper = $this->makeItem(['stock' => 100]);
        $copy = $this->makeService();
        $this->attachMaterial($copy, $paper, 1);

        $this->sales->create($this->cashier, [
            'services' => [['service_id' => $copy->id, 'qty' => 10]],
            'payment_method' => 'qris',
        ]);

        $this->assertEquals(100, $paper->fresh()->stock);
        $this->assertSame(0, StockMutation::count());
    }

    public function test_items_and_services_can_be_sold_on_one_note(): void
    {
        $pen = $this->makeItem(['sell_price' => 3000, 'stock' => 20]);
        $paper = $this->makeItem(['stock' => 50]);
        $copy = $this->makeService(['unit_price' => 300]);
        $this->attachMaterial($copy, $paper, 1);

        $sale = $this->sales->create($this->cashier, [
            'items' => [['item_id' => $pen->id, 'qty' => 2]],
            'services' => [['service_id' => $copy->id, 'qty' => 4]],
            'payment_method' => 'cash',
            'amount_paid' => 10000,
        ]);

        $this->assertEquals(7200, $sale->total_price); // 2x3000 + 4x300
        $this->assertEquals(18, $pen->fresh()->stock);
        $this->assertEquals(46, $paper->fresh()->stock);
    }
}
