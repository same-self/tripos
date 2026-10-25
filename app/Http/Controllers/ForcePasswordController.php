<?php

namespace App\Http\Controllers;

use App\Support\LandingPath;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ForcePasswordController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Auth/ForcePassword');
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'password.confirmed' => 'Ulangi password baru dengan benar.',
        ]);

        $user = $request->user();

        if (Hash::check($data['password'], $user->password)) {
            return back()->withErrors([
                'password' => 'Password baru harus berbeda dari password sementara.',
            ]);
        }

        $user->forceFill([
            'password' => $data['password'],
            'must_change_password' => false,
        ])->save();

        return redirect(LandingPath::for($user))->with('success', 'Password berhasil diganti.');
    }
}