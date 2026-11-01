<?php

namespace Tests\Feature\Catalog;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class StockFilterTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private function seedStock(): void
    {
        $this->makeItem(['name' => 'Aman', 'stock' => 20, 'min_stock' => 5]);
        $this->makeItem(['name' => 'Tepat minimum', 'stock' => 5, 'min_stock' => 5]);
        $this->makeItem(['name' => 'Menipis', 'stock' => 2, 'min_stock' => 5]);
        $this->makeItem(['name' => 'Habis', 'stock' => 0, 'min_stock' => 5]);
        $this->makeItem(['name' => 'Minus', 'stock' => -3, 'min_stock' => 0]);
    }

    public function test_menipis_shows_items_still_in_stock_at_or_below_the_minimum(): void
    {
        $this->seedStock();

        $this->actingAs($this->makeAdmin())->get('/barang?stok=menipis')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.stok', 'menipis')
                ->has('items', 2)
                ->where('items.0.name', 'Menipis')
                ->where('items.1.name', 'Tepat minimum'));
    }

    public function test_habis_shows_items_with_zero_or_negative_stock(): void
    {
        $this->seedStock();

        $this->actingAs($this->makeAdmin())->get('/barang?stok=habis')
            ->assertInertia(fn (Assert $page) => $page
                ->has('items', 2)
                ->where('items.0.name', 'Habis')
                ->where('items.0.out_of_stock', true)
                ->where('items.1.name', 'Minus'));
    }

    public function test_unknown_status_is_ignored_and_summary_counts_each_group_once(): void
    {
        $this->seedStock();

        $this->actingAs($this->makeAdmin())->get('/barang?stok=apa-saja')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.stok', null)
                ->has('items', 5)
                ->where('summary.total', 5)
                ->where('summary.low_stock', 2)
                ->where('summary.out_of_stock', 2));
    }

    public function test_status_combines_with_search_and_category(): void
    {
        $this->seedStock();

        $this->actingAs($this->makeAdmin())->get('/barang?stok=habis&cari=Min')
            ->assertInertia(fn (Assert $page) => $page
                ->has('items', 1)
                ->where('items.0.name', 'Minus'));
    }

    public function test_pos_marks_out_of_stock_items(): void
    {
        $this->makeItem(['name' => 'Habis', 'stock' => 0]);

        $this->actingAs($this->makeCashier())->get('/kasir/pos')
            ->assertInertia(fn (Assert $page) => $page->where('items.0.out_of_stock', true));
    }
}
