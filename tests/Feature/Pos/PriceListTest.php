<?php

namespace Tests\Feature\Pos;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PriceListTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_view_price_list_with_stock_information(): void
    {
        $this->seed(DatabaseSeeder::class);
        $cashier = User::where('username', 'kasir.toko')->firstOrFail();

        $response = $this->actingAs($cashier)->get(route('kasir.harga'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pos/PriceList')
            ->has('rows')
            ->where('rows.0.kind', 'barang')
            ->has('rows.0.stock')
            ->has('rows.0.low_stock')
        );
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('kasir.harga'))->assertRedirect(route('login'));
    }
}
