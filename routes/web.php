<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PosController;
use App\Http\Controllers\SalesHistoryController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\ForcePasswordController;

Route::get('/', fn () => redirect()->route('login'));

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified', 'role:admin'])->name('dashboard');

Route::get('/riwayat', [SalesHistoryController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('riwayat.index');

Route::get('/riwayat/{sale}', [SalesHistoryController::class, 'show'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('riwayat.show');

Route::get('/barang', [BarangController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('barang.index');

Route::get('/barang/tambah', [BarangController::class, 'create'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('barang.create');

Route::post('/barang', [BarangController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('barang.store');

Route::get('/barang/{item}/ubah', [BarangController::class, 'edit'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('barang.edit');

Route::put('/barang/{item}', [BarangController::class, 'update'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('barang.update');

Route::get('/pengguna', [PenggunaController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('pengguna.index');

Route::post('/pengguna', [PenggunaController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('pengguna.store');

Route::get('/pengguna/{user}/ubah', [PenggunaController::class, 'edit'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->withTrashed()
    ->name('pengguna.edit');

Route::put('/pengguna/{user}', [PenggunaController::class, 'update'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->withTrashed()
    ->name('pengguna.update');

Route::get('/kasir/pos', [PosController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:cashier,admin'])
    ->name('kasir.pos');

Route::post('/kasir/pos', [PosController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:cashier,admin'])
    ->name('kasir.pos.store');

Route::get('/kasir/harga', [PosController::class, 'priceList'])
    ->middleware(['auth', 'verified', 'role:cashier,admin'])
    ->name('kasir.harga');

Route::middleware('auth')->group(function () {
    Route::get('/password/ganti', [ForcePasswordController::class, 'edit'])->name('password.force');
    Route::put('/password/ganti', [ForcePasswordController::class, 'update'])->name('password.force.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
