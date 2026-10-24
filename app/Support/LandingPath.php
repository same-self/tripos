<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Decides where a signed-in user starts. One rule, used after login and when a
 * signed-in user opens /login.
 */
final class LandingPath
{
    public static function for(?User $user): string
    {
        abort_if(! $user, 403);

        // Admin: the owner's Dashboard (route "dashboard", /dashboard).
        if ($user->isAdmin()) {
            return route('dashboard', absolute: false);
        }

        // Cashier: the POS screen once it exists; until then the profile page, because
        // /dashboard is admin-only and would answer 403.
        if (Route::has('kasir.pos')) {
            return route('kasir.pos', absolute: false);
        }

        return route('profile.edit', absolute: false);
    }
}
