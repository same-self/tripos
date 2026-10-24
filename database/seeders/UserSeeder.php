<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // DEVELOPMENT ONLY. "password" is guessable: set real passwords in .env (not in Git):
        //   SEED_ADMIN_PASSWORD='...'   SEED_CASHIER_PASSWORD='...'
        $this->upsert('admin', 'Pemilik Toko', 'admin@trisanet.test', Role::Admin, env('SEED_ADMIN_PASSWORD', 'password'));
        $this->upsert('kasir', 'Kasir Trisanet', 'kasir@trisanet.test', Role::Cashier, env('SEED_CASHIER_PASSWORD', 'password'));
    }

    /**
     * $username is the LOGIN id (lowercase, no spaces); $name is the label shown on screens and receipts.
     */
    private function upsert(string $username, string $name, string $email, Role $role, string $password): void
    {
        $user = User::withTrashed()->where('username', $username)->first() ?? new User;

        // forceFill bypasses the #[Fillable] list so role can be set here.
        // Plain password: the User model's 'hashed' cast hashes it exactly once.
        $user->forceFill([
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'role' => $role,
            'must_change_password' => true,
            'email_verified_at' => now(),
            'deleted_at' => null,
        ])->save();
    }
}
