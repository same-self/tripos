<?php

namespace Tests\Feature\Catalog;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class PenggunaCreateTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    private function form(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Abi Kasir',
            'username' => 'abi.kasir',
            'password' => 'sementara1',
            'role' => 'cashier',
        ], $overrides);
    }

    public function test_the_add_user_form_is_its_own_page(): void
    {
        $this->actingAs($this->makeAdmin())->get('/pengguna/tambah')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Pengguna/Create'));

        $this->assertSame('/pengguna/tambah', route('pengguna.create', absolute: false));
    }

    public function test_a_cashier_cannot_open_or_submit_the_add_user_form(): void
    {
        $cashier = $this->makeCashier();

        $this->actingAs($cashier)->get('/pengguna/tambah')->assertForbidden();
        $this->actingAs($cashier)->post('/pengguna', $this->form())->assertForbidden();
        $this->assertNull(User::where('username', 'abi.kasir')->first());
    }

    public function test_saving_creates_the_account_and_returns_to_the_list(): void
    {
        $this->actingAs($this->makeAdmin())->post('/pengguna', $this->form())
            ->assertRedirect(route('pengguna.index'))
            ->assertSessionHas('success');

        $user = User::where('username', 'abi.kasir')->firstOrFail();

        $this->assertSame(Role::Cashier, $user->role);
        $this->assertTrue($user->must_change_password, 'a temporary password must be changed at first sign-in');
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotSame('sementara1', $user->password, 'the password is stored hashed');
    }

    public function test_the_new_user_can_sign_in_with_the_temporary_password(): void
    {
        $this->actingAs($this->makeAdmin())->post('/pengguna', $this->form());
        auth()->logout();

        $this->flushSession();
        $this->post('/login', ['username' => 'abi.kasir', 'password' => 'sementara1']);

        $this->assertAuthenticatedAs(User::where('username', 'abi.kasir')->first());
    }

    public function test_mistakes_send_the_admin_back_to_the_form_with_messages(): void
    {
        $admin = $this->makeAdmin();
        $this->makeCashier()->update(['username' => 'dipakai']);

        $this->actingAs($admin)->from('/pengguna/tambah')
            ->post('/pengguna', $this->form(['username' => 'dipakai']))
            ->assertRedirect('/pengguna/tambah')
            ->assertSessionHasErrors('username');

        $this->actingAs($admin)->from('/pengguna/tambah')
            ->post('/pengguna', $this->form(['username' => 'ada spasi']))
            ->assertSessionHasErrors('username');

        $this->actingAs($admin)->from('/pengguna/tambah')
            ->post('/pengguna', $this->form(['password' => '123']))
            ->assertSessionHasErrors('password');

        $this->actingAs($admin)->from('/pengguna/tambah')
            ->post('/pengguna', $this->form(['role' => 'pemilik']))
            ->assertSessionHasErrors('role');

        $this->assertNull(User::where('username', 'abi.kasir')->first());
    }

    public function test_the_user_list_no_longer_carries_the_inline_form(): void
    {
        $this->actingAs($this->makeAdmin())->get('/pengguna')
            ->assertInertia(fn (Assert $page) => $page->component('Pengguna/Index')->has('users', 1));
    }
}
