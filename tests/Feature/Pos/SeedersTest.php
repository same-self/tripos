<?php

namespace Tests\Feature\Pos;

use App\Models\Item;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeedersTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeding_creates_the_two_users_and_a_catalog(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertTrue(User::where('username', 'admin.toko')->firstOrFail()->isAdmin());
        $this->assertTrue(User::where('username', 'kasir.toko')->firstOrFail()->isCashier());

        $this->assertGreaterThan(0, Item::count());
        $this->assertGreaterThan(0, Service::count());
    }

    public function test_seeding_twice_does_not_duplicate_anything(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(2, User::count());
        $this->assertSame(6, Item::count());
    }

    public function test_seeded_cashier_can_log_in_with_the_seeded_password(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->post('/login', [
            'username' => 'kasir.toko',
            'password' => env('SEED_CASHIER_PASSWORD', 'password'),
        ])->assertSessionHasNoErrors();

        $this->assertAuthenticated();
    }

    public function test_seeded_admin_logs_in_and_lands_on_the_dashboard(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->post('/login', [
            'username' => 'admin.toko',
            'password' => env('SEED_ADMIN_PASSWORD', 'password'),
        ])->assertSessionHasNoErrors()
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
    }
}
