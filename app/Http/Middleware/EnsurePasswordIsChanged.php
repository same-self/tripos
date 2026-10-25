<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // A temporary password must be replaced before using the app.
        // The password screen and sign-out stay open so nobody gets stuck.
        if ($user && $user->must_change_password && ! $request->routeIs(['password.force', 'password.force.update', 'logout'])) {
            return redirect()->route('password.force');
        }

        return $next($request);
    }
}