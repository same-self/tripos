<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPathTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_is_sent_to_the_dashboard_after_login(): void
    {
        $admin = User::factory()->admin()->create();

        $this->post('/login', ['username' => $admin->username, 'password' => 'password'])
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticatedAs($admin);
    }

    public function test_cashier_is_not_sent_to_the_admin_dashboard(): void
    {
        $cashier = User::factory()->cashier()->create();

        // Cashiers land on the POS screen.
        $this->post('/login', ['username' => $cashier->username, 'password' => 'password'])
            ->assertRedirect(route('kasir.pos', absolute: false));
    }

    public function test_a_signed_in_admin_who_opens_login_is_sent_to_the_dashboard(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/login')
            ->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_admin_can_open_the_dashboard(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_cashier_cannot_open_the_dashboard(): void
    {
        $this->actingAs(User::factory()->cashier()->create())
            ->get('/dashboard')
            ->assertForbidden();
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_soft_deleted_users_can_not_log_in(): void
    {
        $user = User::factory()->create();
        $user->delete();

        $this->post('/login', ['username' => $user->username, 'password' => 'password'])
            ->assertSessionHasErrors('username');

        $this->assertGuest();
    }
}
