<?php

namespace Tests\Feature\Pos;

use App\Services\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class StockAndReportScreensTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private function sell($item, int $qty): void
    {
        app(SaleService::class)->create($this->makeCashier(), [
            'items' => [['item_id' => $item->id, 'qty' => $qty]],
            'payment_method' => 'qris',
        ]);
    }

    public function test_restock_suggestion_covers_the_whole_window(): void
    {
        $item = $this->makeItem(['stock' => 100]);
        $this->sell($item, 60); // 60 sold in the 30-day window = 2 a day, 40 left

        $this->actingAs($this->makeAdmin())->get('/stok')->assertInertia(function (Assert $p) {
            $p->component('Stok/Index')
                ->where('thresholds.fast', 80)
                ->where('thresholds.slow', 10);

            $row = collect($p->toArray()['props']['restokSegera'])
                ->merge($p->toArray()['props']['restokNanti'])->first();

            $this->assertSame(2.0, (float) $row['per_day']);
            $this->assertSame(20, $row['suggested_qty'], '2 a day x 30 days = 60, minus the 40 left');
        });
    }

    public function test_an_out_of_stock_item_that_sells_is_flagged_and_suggested(): void
    {
        $item = $this->makeItem(['stock' => 5]);
        $this->sell($item, 5);

        $this->actingAs($this->makeAdmin())->get('/stok')->assertInertia(function (Assert $p) {
            $row = $p->toArray()['props']['restokSegera'][0];
            $this->assertTrue($row['out_of_stock']);
            $this->assertGreaterThan(0, $row['suggested_qty']);
        });
    }

    public function test_the_restock_form_opens_prefilled_from_the_suggestions(): void
    {
        $item = $this->makeItem(['cost_price' => 700]);

        $this->actingAs($this->makeAdmin())->get("/restok?isi={$item->id}:25,9999:3,abc")->assertInertia(
            fn (Assert $p) => $p->component('Restok/Index')
                ->has('prefill', 1)
                ->where('prefill.0.item_id', (string) $item->id)
                ->where('prefill.0.qty', '25')
                ->where('prefill.0.purchase_price', '700')
        );
    }

    public function test_the_item_screen_sends_the_status_thresholds(): void
    {
        $this->actingAs($this->makeAdmin())->get('/barang')->assertInertia(
            fn (Assert $p) => $p->where('thresholds.fast', 80)->where('thresholds.slow', 10)->has('thresholds.window')
        );
    }

    public function test_the_sales_ranking_lists_items_and_services_by_revenue(): void
    {
        $cheap = $this->makeItem(['sell_price' => 1000, 'stock' => 50]);
        $big = $this->makeItem(['sell_price' => 5000, 'stock' => 50]);
        $this->sell($cheap, 3);
        $this->sell($big, 2);

        $this->actingAs($this->makeAdmin())->get('/laporan?tab=ranking')->assertInertia(function (Assert $p) use ($big) {
            $p->component('Laporan/Index')->where('ranking.rows.0.name', $big->name)->where('ranking.rows.0.rank', 1);
            $this->assertSame(13000, $p->toArray()['props']['ranking']['total']);
        });
    }

    public function test_cash_flow_comes_with_one_row_per_day_for_paging(): void
    {
        $this->actingAs($this->makeAdmin())->get('/laporan?tab=arus-kas&periode=30')->assertInertia(
            fn (Assert $p) => $p->has('arusKas.days', 30)->has('arusKas.days.0', fn ($d) => $d->hasAll(['label', 'income', 'spending', 'net']))
        );
    }

    public function test_the_slow_seller_list_flags_out_of_stock_items(): void
    {
        $item = $this->makeItem(['stock' => 3]);
        $this->sell($item, 3);

        $this->actingAs($this->makeAdmin())->get('/laporan?tab=terlaris')->assertInertia(
            fn (Assert $p) => $p->where('terlaris.lambat.0.out_of_stock', true)
        );
    }
}
