<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        // Provisional values from the design report: still waiting for the owner to confirm.
        Setting::put('fast_moving_threshold', 80);   // sold >= this in the window -> "Cepat laku"
        Setting::put('slow_moving_threshold', 10);   // sold <  this in the window -> "Lambat"
        Setting::put('report_window_days', 30);

        // Open decisions, defaulted to the safe-for-a-busy-shop choice:
        Setting::put('auto_deduct_service_materials', true);  // photocopy uses paper -> stock drops
        Setting::put('allow_negative_stock', true);           // never block the queue; flag it instead
    }
}
