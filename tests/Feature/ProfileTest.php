<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\BuildsPosData;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use BuildsPosData, RefreshDatabase;

    public function test_admin_and_cashier_can_open_their_profile(): void
    {
        $this->actingAs($this->makeAdmin())->get('/profile')->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Profile/Edit')->where('isAdmin', true));

        $this->actingAs($this->makeCashier())->get('/profile')->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Profile/Edit')->where('isAdmin', false));
    }

    public function test_guests_cannot_open_the_profile(): void
    {
        $this->get('/profile')->assertRedirect('/login');
    }

    public function test_a_user_can_change_their_name(): void
    {
        $user = $this->makeCashier();

        $this->actingAs($user)->patch('/profile', ['name' => 'Nama Baru'])
            ->assertSessionHasNoErrors();

        $this->assertSame('Nama Baru', $user->refresh()->name);
    }

    public function test_a_user_cannot_change_their_role_or_username_from_the_profile(): void
    {
        $user = $this->makeCashier();
        $username = $user->username;

        $this->actingAs($user)->patch('/profile', [
            'name' => 'Nama Baru',
            'role' => 'admin',
            'username' => 'hacker',
        ])->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertFalse($user->isAdmin());
        $this->assertSame($username, $user->username);
    }

    public function test_the_name_is_required(): void
    {
        $this->actingAs($this->makeCashier())->patch('/profile', ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_the_password_can_be_changed_without_the_current_one(): void
    {
        $user = $this->makeCashier();
        $user->forceFill(['password' => 'lama-123'])->save();

        $this->actingAs($user)->put('/profile/password', [
            'password' => 'baru-4567',
            'password_confirmation' => 'baru-4567',
        ])->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('baru-4567', $user->refresh()->password));
    }

    public function test_the_new_password_needs_six_characters_and_a_matching_repeat(): void
    {
        $user = $this->makeCashier();
        $user->forceFill(['password' => 'lama-123'])->save();

        $this->actingAs($user)->put('/profile/password', [
            'password' => 'abc',
            'password_confirmation' => 'abc',
        ])->assertSessionHasErrors('password');

        $this->actingAs($user)->put('/profile/password', [
            'password' => 'baru-4567',
            'password_confirmation' => 'lain-4567',
        ])->assertSessionHasErrors('password');
    }

    public function test_there_is_no_forced_password_screen_any_more(): void
    {
        $user = $this->makeAdmin();
        $user->forceFill(['must_change_password' => true])->save();

        // A leftover flag on an old account must not block the app
        $this->actingAs($user)->get('/dashboard')->assertOk();
        $this->actingAs($user)->get('/password/ganti')->assertNotFound();
    }
}
