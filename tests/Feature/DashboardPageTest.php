<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_gets_the_report_as_page_props(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('report.period', 30)
                ->has('report.kpis')
                ->has('report.daily', 30)
                ->has('report.recent')
                ->has('report.recommendations'));
    }

    public function test_period_switch_to_seven_days(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get('/dashboard?period=7')
            ->assertInertia(fn (Assert $page) => $page
                ->where('report.period', 7)
                ->has('report.daily', 7));
    }

    public function test_unknown_periods_fall_back_to_thirty_days(): void
    {
        $admin = User::factory()->admin()->create();

        foreach (['abc', '9999', '0', '-5', ''] as $bad) {
            $this->actingAs($admin)
                ->get('/dashboard?period='.$bad)
                ->assertInertia(fn (Assert $page) => $page->where('report.period', 30));
        }
    }

    public function test_cashier_cannot_see_the_report(): void
    {
        $this->actingAs(User::factory()->cashier()->create())
            ->get('/dashboard')
            ->assertForbidden();
    }
}
