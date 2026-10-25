<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class OwnerSeeder extends Seeder
{
    public function run(): void
    {
        // firstOrCreate means running the seeder twice won't make a duplicate account
        User::firstOrCreate(
            ['username' => 'admin.toko'],
            [
                'name' => 'Pemilik Toko',
                'email' => 'admin@tripos.test',
                'password' => env('DEMO_OWNER_PASSWORD', 'admin123'),
            ]
        );
    }
}