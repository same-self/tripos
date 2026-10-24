<?php

namespace Tests\Feature\Pos;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Throw-away routes that exist only for this test.
        Route::middleware(['web', 'auth', 'role:admin'])->get('/_test/admin-only', fn () => 'ok');
        Route::middleware(['web', 'auth', 'role:cashier,admin'])->get('/_test/staff', fn () => 'ok');
    }

    public function test_cashier_cannot_open_an_admin_only_route(): void
    {
        $this->actingAs($this->makeCashier())->get('/_test/admin-only')->assertForbidden();
    }

    public function test_admin_can_open_admin_only_and_staff_routes(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->get('/_test/admin-only')->assertOk();
        $this->actingAs($admin)->get('/_test/staff')->assertOk();
    }

    public function test_cashier_can_open_a_staff_route(): void
    {
        $this->actingAs($this->makeCashier())->get('/_test/staff')->assertOk();
    }

    public function test_guests_are_sent_to_login(): void
    {
        $this->get('/_test/staff')->assertRedirect(route('login'));
    }
}
