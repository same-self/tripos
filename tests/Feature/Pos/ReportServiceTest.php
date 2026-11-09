<?php

namespace Tests\Feature\Pos;

use App\Models\Item;
use App\Models\Sale;
use App\Models\User;
use App\Services\PurchaseService;
use App\Services\ReportService;
use App\Services\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class ReportServiceTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private User $cashier;

    private ReportService $reports;

    protected function setUp(): void
    {
        parent::setUp();

        // Saturday 24 Oct 2026, midday. Every date below is relative to this moment.
        $this->travelTo(Carbon::parse('2026-10-24 12:00:00'));

        $this->cashier = $this->makeCashier();
        $this->reports = app(ReportService::class);
    }

    /** Sells $qty of $item on $date and returns the sale. */
    private function sell(Item $item, int $qty, string $date, string $method = 'qris'): Sale
    {
        return app(SaleService::class)->create($this->cashier, [
            'items' => [['item_id' => $item->id, 'qty' => $qty]],
            'payment_method' => $method,
            'amount_paid' => 10_000_000,
            'transacted_at' => $date,
        ]);
    }

    public function test_kpis_cover_only_the_period_and_compare_with_the_previous_one(): void
    {
        $item = $this->makeItem(['sell_price' => 1000, 'cost_price' => 400, 'stock' => 1000]);

        $this->sell($item, 5, '2026-10-24 10:00');      // in period: 5.000
        $this->sell($item, 3, '2026-10-20 09:00');      // in period: 3.000
        $this->sell($item, 2, '2026-10-15 09:00');      // previous period (11-17 Oct): 2.000
        $this->sell($item, 9, '2026-10-01 09:00');      // older than both: ignored
        $this->sell($item, 4, '2026-10-22 09:00')->delete(); // soft-deleted: ignored

        $purchase = app(PurchaseService::class);
        $supplier = $this->makeSupplier();
        $purchase->create($this->makeAdmin(), [
            'supplier_id' => $supplier->id,
            'transacted_at' => '2026-10-21 08:00',
            'lines' => [['item_id' => $item->id, 'qty' => 3, 'purchase_price' => 1000]],   // 3.000 in period
        ]);
        $purchase->create($this->makeAdmin(), [
            'supplier_id' => $supplier->id,
            'transacted_at' => '2026-10-02 08:00',
            'lines' => [['item_id' => $item->id, 'qty' => 7, 'purchase_price' => 1000]],   // outside: ignored
        ]);

        $kpis = $this->reports->dashboard(7)['kpis'];

        $this->assertSame(8000, $kpis['income']);
        $this->assertSame(300.0, $kpis['income_change']);          // (8000 - 2000) / 2000
        $this->assertSame(2, $kpis['transactions']);
        $this->assertSame(100.0, $kpis['transactions_change']);    // 2 vs 1
        $this->assertSame(3000, $kpis['purchases']);
        $this->assertSame(5000, $kpis['net_cash_flow']);
    }

    public function test_change_is_null_when_the_previous_period_had_no_sales(): void
    {
        $item = $this->makeItem(['sell_price' => 1000, 'stock' => 100]);
        $this->sell($item, 1, '2026-10-24 10:00');

        $kpis = $this->reports->dashboard(7)['kpis'];

        $this->assertSame(1000, $kpis['income']);
        $this->assertNull($kpis['income_change']);
        $this->assertNull($kpis['transactions_change']);
    }

    public function test_an_empty_shop_returns_zeros_and_no_cards(): void
    {
        $report = $this->reports->dashboard(30);

        $this->assertSame(0, $report['kpis']['income']);
        $this->assertSame(0, $report['kpis']['net_cash_flow']);
        $this->assertSame([], $report['recent']);
        $this->assertSame([], $report['recommendations']);
        $this->assertCount(30, $report['daily']);
    }

    public function test_daily_series_is_oldest_first_and_fills_empty_days_with_zero(): void
    {
        $item = $this->makeItem(['sell_price' => 1000, 'stock' => 100]);
        $this->sell($item, 5, '2026-10-24 10:00');
        $this->sell($item, 3, '2026-10-20 09:00');
        $this->sell($item, 1, '2026-10-20 15:00');   // same day: summed

        $daily = $this->reports->dashboard(7)['daily'];

        $this->assertCount(7, $daily);
        $this->assertSame('2026-10-18', $daily[0]['date']);
        $this->assertSame('2026-10-24', $daily[6]['date']);
        $this->assertSame('Min', $daily[0]['label']);   // 18 Oct 2026 is a Sunday
        $this->assertSame('Sab', $daily[6]['label']);
        $this->assertSame(4000, $daily[2]['income']);   // 20 Oct
        $this->assertSame(0, $daily[3]['income']);      // 21 Oct: nothing sold
        $this->assertSame(5000, $daily[6]['income']);
    }

    public function test_longer_ranges_are_labelled_day_slash_month(): void
    {
        $daily = $this->reports->dashboard(30)['daily'];

        $this->assertSame('25/9', $daily[0]['label']);
        $this->assertSame('24/10', $daily[29]['label']);
    }

    public function test_recent_sales_are_the_latest_five_newest_first(): void
    {
        $item = $this->makeItem(['sell_price' => 1000, 'stock' => 100]);

        foreach (['10:01', '10:02', '10:03', '10:04', '10:05', '10:06'] as $time) {
            $this->sell($item, 1, "2026-10-24 {$time}", $time === '10:06' ? 'cash' : 'qris');
        }

        $recent = $this->reports->dashboard(7)['recent'];

        $this->assertCount(5, $recent);
        $this->assertSame('10:06', $recent[0]['time']);
        $this->assertSame('Tunai', $recent[0]['method']);
        $this->assertSame('QRIS', $recent[1]['method']);
        $this->assertSame('10:02', $recent[4]['time']);
        $this->assertSame($this->cashier->name, $recent[0]['cashier']);
        $this->assertSame(1000, $recent[0]['amount']);
    }

    public function test_top_profit_card_names_the_item_with_the_biggest_profit(): void
    {
        $big = $this->makeItem(['name' => 'Kertas HVS A4', 'sell_price' => 1100, 'cost_price' => 100, 'stock' => 100]);
        $small = $this->makeItem(['name' => 'Pulpen', 'sell_price' => 1000, 'cost_price' => 900, 'stock' => 100]);

        $this->sell($big, 2, '2026-10-23 10:00');     // profit 2.000
        $this->sell($small, 5, '2026-10-23 11:00');   // profit 500

        $cards = collect($this->reports->dashboard(30)['recommendations']);
        $top = $cards->firstWhere('tag', 'Untung terbesar');

        $this->assertNotNull($top);
        $this->assertSame('Kertas HVS A4', $top['title']);
        $this->assertSame('Sekitar Rp 2.000 keuntungan dalam 30 hari.', $top['text']);
    }

    public function test_a_sale_below_cost_price_never_becomes_the_top_profit(): void
    {
        $loss = $this->makeItem(['sell_price' => 500, 'cost_price' => 900, 'stock' => 100]);
        $this->sell($loss, 3, '2026-10-23 10:00');

        $tags = collect($this->reports->dashboard(30)['recommendations'])->pluck('tag');

        $this->assertNotContains('Untung terbesar', $tags);
    }

    public function test_idle_capital_card_lists_slow_items_that_are_still_in_stock(): void
    {
        $this->makeItem(['name' => 'Amplop', 'stock' => 12, 'cost_price' => 1000]);      // 12.000 idle
        $this->makeItem(['name' => 'Map Plastik', 'stock' => 5, 'cost_price' => 2000]);  // 10.000 idle
        $this->makeItem(['name' => 'Habis', 'stock' => 0, 'cost_price' => 5000]);        // no stock: not capital
        $fast = $this->makeItem(['name' => 'Laris', 'stock' => 100, 'cost_price' => 500, 'sell_price' => 900]);
        $this->sell($fast, 15, '2026-10-23 10:00');                                       // sold >= 10: not slow

        $card = collect($this->reports->dashboard(30)['recommendations'])->firstWhere('tag', 'Modal mengendap');

        $this->assertNotNull($card);
        $this->assertSame('Rp 22.000 tertahan di 2 barang', $card['title']);
        $this->assertSame('Amplop dan Map Plastik jarang terjual.', $card['text']);
        $this->assertSame('danger', $card['tone']);
    }

    public function test_more_than_three_idle_items_are_summarised(): void
    {
        foreach ([5000, 4000, 3000, 2000, 1000] as $i => $capital) {
            $this->makeItem(['name' => "Barang {$i}", 'stock' => 1, 'cost_price' => $capital]);
        }

        $card = collect($this->reports->dashboard(30)['recommendations'])->firstWhere('tag', 'Modal mengendap');

        $this->assertSame('Rp 15.000 tertahan di 5 barang', $card['title']);
        $this->assertSame('Barang 0, Barang 1, Barang 2, dan lainnya jarang terjual.', $card['text']);
    }

    public function test_top_profit_item_is_excluded_from_idle_capital_card(): void
    {
        $flashdisk = $this->makeItem(['name' => 'Flashdisk', 'sell_price' => 100_000, 'cost_price' => 70_000, 'stock' => 5]);
        $idleItem = $this->makeItem(['name' => 'Amplop', 'sell_price' => 1000, 'cost_price' => 500, 'stock' => 10]);

        $this->sell($flashdisk, 2, '2026-10-23 10:00'); // 60.000 profit, but only 2 sold (< 10)

        $cards = collect($this->reports->dashboard(30)['recommendations']);
        $top = $cards->firstWhere('tag', 'Untung terbesar');
        $idle = $cards->firstWhere('tag', 'Modal mengendap');

        $this->assertNotNull($top);
        $this->assertSame('Flashdisk', $top['title']);

        $this->assertNotNull($idle);
        $this->assertStringNotContainsString('Flashdisk', $idle['text']);
        $this->assertStringContainsString('Amplop', $idle['text']);
    }

    public function test_raw_materials_consumed_by_services_are_not_flagged_as_idle(): void
    {
        $paper = $this->makeItem(['name' => 'Kertas HVS A4', 'stock' => 500, 'cost_price' => 300, 'sell_price' => 500]);
        $service = $this->makeService(['name' => 'Fotocopy', 'unit_price' => 1000]);
        $this->attachMaterial($service, $paper, 1.0);

        app(SaleService::class)->create($this->cashier, [
            'services' => [['service_id' => $service->id, 'qty' => 15]],
            'payment_method' => 'cash',
            'amount_paid' => 50_000,
            'transacted_at' => '2026-10-23 10:00',
        ]);

        $card = collect($this->reports->dashboard(30)['recommendations'])->firstWhere('tag', 'Modal mengendap');

        if ($card) {
            $this->assertStringNotContainsString('Kertas HVS A4', $card['text']);
        } else {
            $this->assertNull($card);
        }
    }

    public function test_soft_deleted_sale_does_not_prevent_item_from_being_flagged_as_idle(): void
    {
        $pen = $this->makeItem(['name' => 'Pulpen Gel', 'stock' => 20, 'cost_price' => 2000, 'sell_price' => 3000]);

        $sale = $this->sell($pen, 15, '2026-10-23 10:00');
        $sale->delete(); // Soft-deleted sale

        $card = collect($this->reports->dashboard(30)['recommendations'])->firstWhere('tag', 'Modal mengendap');

        $this->assertNotNull($card);
        $this->assertStringContainsString('Pulpen Gel', $card['text']);
    }

    public function test_combined_retail_and_service_usage_exceeding_threshold_is_not_idle(): void
    {
        $paper = $this->makeItem(['name' => 'Kertas F4', 'stock' => 100, 'cost_price' => 300, 'sell_price' => 500]);
        $service = $this->makeService(['name' => 'Cetak Dokumen', 'unit_price' => 1000]);
        $this->attachMaterial($service, $paper, 1.0);

        // 5 units retail sale
        $this->sell($paper, 5, '2026-10-23 10:00');

        // 6 units consumed via service (total = 11 >= 10)
        app(SaleService::class)->create($this->cashier, [
            'services' => [['service_id' => $service->id, 'qty' => 6]],
            'payment_method' => 'cash',
            'amount_paid' => 20_000,
            'transacted_at' => '2026-10-23 11:00',
        ]);

        $card = collect($this->reports->dashboard(30)['recommendations'])->firstWhere('tag', 'Modal mengendap');

        if ($card) {
            $this->assertStringNotContainsString('Kertas F4', $card['text']);
        } else {
            $this->assertNull($card);
        }
    }
}

