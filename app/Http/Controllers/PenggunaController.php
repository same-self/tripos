<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Purchase;
use App\Models\Sale;
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
        // withTrashed so deactivated accounts still show, marked as Nonaktif.
        // Accounts the owner deleted (removed_at) are kept in the database for old receipts, but not listed.
        $users = User::withTrashed()
            ->whereNull('removed_at')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role->value,
                'role_label' => $user->role === Role::Admin ? 'Admin' : 'Kasir',
                'active' => $user->deleted_at === null,
                'is_super_admin' => $user->is_super_admin,
                // Everyone can be deleted except the owner's account and the account in use
                'can_edit' => ! $user->is_super_admin || $user->is(auth()->user()),
                'can_delete' => ! $user->is_super_admin && ! $user->is(auth()->user()),
            ]);

        return Inertia::render('Pengguna/Index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Pengguna/Create');
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
            'must_change_password' => false,
            // The placeholder email cannot receive a verification link, so mark it verified
            'email_verified_at' => now(),
        ])->save();

        return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(User $user): Response
    {
        $this->guardOwner($user);

        return Inertia::render('Pengguna/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role->value,
                'active' => $user->deleted_at === null,
                'is_self' => auth()->id() === $user->id,
                'is_super_admin' => $user->is_super_admin,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->guardOwner($user);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z0-9._-]+$/', Rule::unique('users', 'username')->ignore($user->id)],
            'role' => ['required', Rule::enum(Role::class)],
            'active' => ['required', 'boolean'],
            'password' => ['nullable', 'string', 'min:6'],
        ], $this->messages());

        // The owner's account is fixed: always active and always Admin
        if ($user->is_super_admin && (! $data['active'] || $data['role'] !== Role::Admin->value)) {
            return back()->withErrors([
                'role' => 'Akun pemilik toko tidak bisa dinonaktifkan atau diturunkan perannya.',
            ]);
        }

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
            // The owner sets the new password directly. The user can change it later from their Profil page.
            $user->forceFill([
                'password' => $data['password'],
                'must_change_password' => false,
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

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->guardOwner($user, true);

        if ($user->is_super_admin) {
            return back()->withErrors(['hapus' => 'Akun pemilik toko tidak bisa dihapus.']);
        }

        if ($user->is($request->user())) {
            return back()->withErrors(['hapus' => 'Akun yang sedang dipakai tidak bisa dihapus.']);
        }

        $hasHistory = Sale::withTrashed()->where('user_id', $user->id)->exists()
            || Purchase::withTrashed()->where('user_id', $user->id)->exists();

        if ($hasHistory) {
            // Old receipts and purchases still point at this account, so the row stays (with its name)
            // but is closed and hidden. The username is renamed so it can be used again for someone new.
            $user->forceFill([
                'username' => $user->username.'~dihapus'.$user->id,
                'removed_at' => now(),
            ])->save();

            if (! $user->trashed()) {
                $user->delete();
            }

            return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil dihapus. Riwayat transaksinya tetap tersimpan.');
        }

        // No sales or purchases point to this account, so it can be removed completely
        $user->forceDelete();

        return redirect()->route('pengguna.index')->with('success', 'Pengguna berhasil dihapus.');
    }

    /** The owner account is hard-wired: no other admin may view, change or delete it. */
    private function guardOwner(User $user, bool $always = false): void
    {
        if ($user->is_super_admin && ($always || ! $user->is(auth()->user()))) {
            abort(403, 'Akun pemilik toko tidak bisa diubah oleh pengguna lain.');
        }
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
