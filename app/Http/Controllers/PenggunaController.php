<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PenggunaController extends Controller
{
    public function index(): Response
    {
        // withTrashed so deactivated accounts still show, marked as Nonaktif
        $users = User::withTrashed()
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role->value,
                'role_label' => $user->role === Role::Admin ? 'Admin' : 'Kasir',
                'active' => $user->deleted_at === null,
            ]);

        return Inertia::render('Pengguna/Index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z0-9._-]+$/', 'unique:users,username'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::enum(Role::class)],
        ], $this->messages());

        $user = new User([
            'name' => $data['name'],
            'username' => $data['username'],
            // The database requires an email, so new accounts get one based on the username
            'email' => $data['username'].'@tripos.local',
            'password' => $data['password'],
        ]);

        // Role and the reset flag are not fillable, so they are set separately
        $user->forceFill([
            'role' => $data['role'],
            'must_change_password' => true,
            // The placeholder email cannot receive a verification link, so mark it verified
            'email_verified_at' => now(),
        ])->save();

        return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Pengguna/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role->value,
                'active' => $user->deleted_at === null,
                'is_self' => auth()->id() === $user->id,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z0-9._-]+$/', Rule::unique('users', 'username')->ignore($user->id)],
            'role' => ['required', Rule::enum(Role::class)],
            'active' => ['required', 'boolean'],
            'password' => ['nullable', 'string', 'min:6'],
        ], $this->messages());

        // The owner cannot lock themselves out or remove their own admin role
        if ($user->is($request->user()) && (! $data['active'] || $data['role'] !== Role::Admin->value)) {
            return back()->withErrors([
                'role' => 'Akun yang sedang dipakai tidak bisa dinonaktifkan atau diturunkan perannya.',
            ]);
        }

        $user->forceFill([
            'name' => $data['name'],
            'username' => $data['username'],
            'role' => $data['role'],
        ]);

        if (! empty($data['password'])) {
            // A reset password must be changed at the next sign-in
            $user->forceFill([
                'password' => $data['password'],
                'must_change_password' => true,
            ]);
        }

        $user->save();

        if ($data['active'] && $user->trashed()) {
            $user->restore();
        } elseif (! $data['active'] && ! $user->trashed()) {
            $user->delete();
        }

        return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    private function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.max' => 'Username terlalu panjang.',
            'username.regex' => 'Username hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda minus.',
            'username.unique' => 'Username sudah dipakai.',
            'password.required' => 'Password sementara wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'role.required' => 'Pilih peran pengguna.',
            'role.enum' => 'Peran yang dipilih tidak dikenal.',
        ];
    }
}