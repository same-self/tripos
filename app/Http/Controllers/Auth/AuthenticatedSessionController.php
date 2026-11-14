<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\LandingPath;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        // Cashiers must ALWAYS land on their POS screen (kasir.pos) and never be sent to
        // admin-only intended URLs stored in session (which triggers a 403 Forbidden error).
        if (! $user->isAdmin()) {
            $request->session()->forget('url.intended');
            return redirect(LandingPath::for($user));
        }

        // For admin, clear stale intended URLs like login
        $intended = $request->session()->get('url.intended');
        if ($intended && str_contains($intended, '/login')) {
            $request->session()->forget('url.intended');
        }

        return redirect()->intended(LandingPath::for($user));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
