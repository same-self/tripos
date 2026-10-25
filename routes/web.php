<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PosController;
use App\Http\Controllers\SalesHistoryController;

Route::get('/', fn () => redirect()->route('login'));

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified', 'role:admin'])->name('dashboard');

Route::get('/riwayat', [SalesHistoryController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('riwayat.index');

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
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
