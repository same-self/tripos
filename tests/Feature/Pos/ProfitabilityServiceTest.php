<?php

namespace Tests\Feature\Pos;

use App\Models\Item;
use App\Models\Sale;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Services\ProfitabilityService;
use App\Services\ReportService;
use App\Services\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class ProfitabilityServiceTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private User $cashier;

    private ProfitabilityService $profit;

    protected function setUp(): void
    {
        parent::setUp();

        // Saturday 24 Oct 2026, midday. Every date below is relative to this moment.
        $this->travelTo(Carbon::parse('2026-10-24 12:00:00'));

        $this->cashier = $this->makeCashier();
        $this->profit = app(ProfitabilityService::class);
    }

    private function sellItem(Item $item, int $qty, string $date = '2026-10-23 10:00'): Sale
    {
        return app(SaleService::class)->create($this->cashier, [
            'items' => [['item_id' => $item->id, 'qty' => $qty]],
            'payment_method' => 'qris',
            'transacted_at' => $date,
        ]);
    }

    private function sellService(Service $service, int $qty, string $date = '2026-10-23 10:00'): Sale
    {
        return app(SaleService::class)->create($this->cashier, [
            'services' => [['service_id' => $service->id, 'qty' => $qty]],
            'payment_method' => 'qris',
            'transacted_at' => $date,
        ]);
    }

    /** A photocopy service of Rp 300 per sheet whose paper costs Rp 100 per sheet (Rp 50.000 a ream, 0,002 ream per sheet). */
    private function makeCopyService(string $name = 'Fotokopi A4'): Service
    {
        $paper = $this->makeItem(['name' => 'Kertas A4', 'cost_price' => 50000]);
        $service = $this->makeService(['name' => $name, 'unit_price' => 300]);
        $this->attachMaterial($service, $paper, 0.002);

        return $service;
    }

    private function rows(): array
    {
        return collect($this->profit->ranking(30)['rows'])->keyBy('key')->all();
    }

    public function test_items_and_services_are_ranked_together_by_profit(): void
    {
        $item = $this->makeItem(['name' => 'Pulpen', 'sell_price' => 2500, 'cost_price' => 1000, 'stock' => 100]);
        $this->sellItem($item, 10);                              // revenue 25.000, cost 10.000, profit 15.000

        $copy = $this->makeCopyService();
        $this->sellService($copy, 100);                          // revenue 30.000, paper 10.000, profit 20.000

        $rows = $this->profit->ranking(30)['rows'];

        $this->assertSame(['jasa', 'barang'], array_column($rows, 'kind'));
        $this->assertSame([1, 2], array_column($rows, 'rank'));

        $this->assertSame('Fotokopi A4', $rows[0]['name']);
        $this->assertSame(30000, $rows[0]['revenue']);
        $this->assertSame(10000, $rows[0]['cost']);
        $this->assertSame(20000, $rows[0]['profit']);
        $this->assertSame(66.7, $rows[0]['margin']);
        $this->assertTrue($rows[0]['estimated'], 'a service cost is an estimate');

        $this->assertSame(15000, $rows[1]['profit']);
        $this->assertSame(60.0, $rows[1]['margin']);
        $this->assertFalse($rows[1]['estimated']);
    }

    public function test_item_profit_uses_the_cost_price_saved_with_the_sale(): void
    {
        $item = $this->makeItem(['sell_price' => 2500, 'cost_price' => 1000, 'stock' => 100]);
        $this->sellItem($item, 4);

        // A later restock at a higher price must not rewrite what was earned before
        $item->update(['cost_price' => 2400]);

        $row = $this->rows()['barang-'.$item->id];

        $this->assertSame(4 * 1500, $row['profit']);
        $this->assertSame(4 * 1000, $row['cost']);
    }

    public function test_a_service_without_materials_has_no_cost(): void
    {
        $service = $this->makeService(['unit_price' => 500]);
        $this->sellService($service, 3);

        $row = $this->rows()['jasa-'.$service->id];

        $this->assertSame(0, $row['cost']);
        $this->assertSame(1500, $row['profit']);
        $this->assertSame(100.0, $row['margin']);
    }

    public function test_every_verdict_with_its_reason(): void
    {
        // Four healthy items (margin 50%) with profits 10.000 / 9.000 / 8.000 / 7.000
        foreach ([10, 9, 8, 7] as $qty) {
            $this->sellItem($this->makeItem(['name' => "Sehat {$qty}", 'sell_price' => 2000, 'cost_price' => 1000, 'stock' => 100]), $qty);
        }

        $thin = $this->makeItem(['name' => 'Tipis', 'sell_price' => 1000, 'cost_price' => 900, 'stock' => 100]);
        $this->sellItem($thin, 5);                               // profit 500, margin 10%

        $loss = $this->makeItem(['name' => 'Rugi', 'sell_price' => 500, 'cost_price' => 900, 'stock' => 100]);
        $this->sellItem($loss, 2);                               // profit -800

        $result = $this->profit->ranking(30);
        $verdicts = collect($result['rows'])->pluck('verdict', 'name');

        $this->assertSame('unggulan', $verdicts['Sehat 10']);
        $this->assertSame('unggulan', $verdicts['Sehat 9']);
        $this->assertSame('unggulan', $verdicts['Sehat 8']);
        $this->assertSame('sehat', $verdicts['Sehat 7']);
        $this->assertSame('tipis', $verdicts['Tipis']);
        $this->assertSame('rugi', $verdicts['Rugi']);

        $reasons = collect($result['rows'])->pluck('reason', 'name');
        $this->assertSame('Dijual di bawah modal, rugi Rp 800.', $reasons['Rugi']);
        $this->assertSame('Untung hanya 10% dari penjualan (batas 15%).', $reasons['Tipis']);

        $this->assertSame(['unggulan' => 3, 'sehat' => 1, 'tipis' => 1, 'rugi' => 1], $result['summary']['counts']);
        $this->assertSame(10000 + 9000 + 8000 + 7000 + 500 - 800, $result['summary']['profit']);
        $this->assertSame('Rugi', collect($result['rows'])->last()['name'], 'the loss is at the bottom');
    }

    public function test_the_thin_margin_limit_is_a_setting(): void
    {
        $item = $this->makeItem(['name' => 'Tipis', 'sell_price' => 1000, 'cost_price' => 900, 'stock' => 100]);
        $this->sellItem($item, 5);                               // margin 10%

        $this->assertSame('tipis', $this->rows()['barang-'.$item->id]['verdict']);

        Setting::put('thin_margin_percent', 5);

        $this->assertSame(5, $this->profit->ranking(30)['thin_margin']);
        $this->assertNotSame('tipis', $this->rows()['barang-'.$item->id]['verdict']);
    }

    public function test_only_sales_inside_the_window_count_and_deleted_sales_are_ignored(): void
    {
        $item = $this->makeItem(['sell_price' => 2000, 'cost_price' => 1000, 'stock' => 100]);

        $this->sellItem($item, 2, '2026-10-24 09:00');           // inside
        $this->sellItem($item, 5, '2026-09-01 09:00');           // older than 30 days
        $this->sellItem($item, 7, '2026-10-20 09:00')->delete(); // soft-deleted sale

        $row = $this->rows()['barang-'.$item->id];

        $this->assertSame(2, $row['sold']);
        $this->assertSame(2000, $row['profit']);
        $this->assertCount(0, $this->profit->ranking(7, Carbon::parse('2026-11-30'))['rows'], 'a different "now" moves the window');
    }

    public function test_nothing_sold_gives_an_empty_ranking(): void
    {
        $this->makeItem(['stock' => 50]);
        $this->makeService();

        $result = $this->profit->ranking(30);

        $this->assertSame([], $result['rows']);
        $this->assertSame(0, $result['summary']['profit']);
        $this->assertSame(['unggulan' => 0, 'sehat' => 0, 'tipis' => 0, 'rugi' => 0], $result['summary']['counts']);
    }

    public function test_a_deleted_item_keeps_its_name_in_the_ranking(): void
    {
        $item = $this->makeItem(['name' => 'Barang Lama', 'sell_price' => 2000, 'cost_price' => 1000, 'stock' => 100]);
        $this->sellItem($item, 3);
        $item->delete();

        $this->assertSame('Barang Lama', $this->rows()['barang-'.$item->id]['name']);
    }

    public function test_dashboard_top_card_can_be_a_service_and_says_it_is_an_estimate(): void
    {
        $this->sellItem($this->makeItem(['sell_price' => 2500, 'cost_price' => 1000, 'stock' => 100]), 10);
        $this->sellService($this->makeCopyService(), 100);

        $top = collect(app(ReportService::class)->dashboard(30)['recommendations'])->firstWhere('tag', 'Untung terbesar');

        $this->assertSame('Fotokopi A4 (jasa)', $top['title']);
        $this->assertSame('Sekitar Rp 20.000 perkiraan keuntungan dalam 30 hari.', $top['text']);
    }

    public function test_dashboard_warns_about_items_that_lose_money_or_earn_little(): void
    {
        $this->sellItem($this->makeItem(['name' => 'Bagus', 'sell_price' => 2000, 'cost_price' => 1000, 'stock' => 100]), 5);
        $this->sellItem($this->makeItem(['name' => 'Pulpen Murah', 'sell_price' => 500, 'cost_price' => 900, 'stock' => 100]), 2);
        $this->sellItem($this->makeItem(['name' => 'Map', 'sell_price' => 1000, 'cost_price' => 950, 'stock' => 100]), 4);

        $card = collect(app(ReportService::class)->dashboard(30)['recommendations'])->firstWhere('tag', 'Perlu dicek');

        $this->assertNotNull($card);
        $this->assertSame('danger', $card['tone']);
        $this->assertSame('2 barang/jasa untungnya tipis atau rugi', $card['title']);
        $this->assertSame('Pulpen Murah dan Map. 1 di antaranya dijual di bawah modal.', $card['text']);
    }

    public function test_dashboard_has_no_warning_when_everything_earns_well(): void
    {
        $this->sellItem($this->makeItem(['sell_price' => 2000, 'cost_price' => 1000, 'stock' => 100]), 5);

        $tags = collect(app(ReportService::class)->dashboard(30)['recommendations'])->pluck('tag');

        $this->assertNotContains('Perlu dicek', $tags);
    }

    public function test_laporan_keuntungan_tab_shows_items_and_services(): void
    {
        $this->sellItem($this->makeItem(['sell_price' => 2500, 'cost_price' => 1000, 'stock' => 100]), 10);
        $this->sellService($this->makeCopyService(), 100);

        $this->actingAs($this->makeAdmin())->get('/laporan?tab=keuntungan')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Laporan/Index')
                ->where('tab', 'keuntungan')
                ->has('keuntungan.rows', 2)
                ->where('keuntungan.rows.0.kind', 'jasa')
                ->where('keuntungan.rows.1.kind', 'barang')
                ->where('keuntungan.summary.profit', 35000)
                ->where('keuntungan.thin_margin', 15));
    }

    public function test_a_cashier_cannot_open_the_profit_report(): void
    {
        $this->actingAs($this->makeCashier())->get('/laporan?tab=keuntungan')->assertForbidden();
    }
}
