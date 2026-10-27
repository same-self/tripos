<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PosController;
use App\Http\Controllers\SalesHistoryController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\ForcePasswordController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\LayananController;
use App\Http\Controllers\RestokController;
use App\Http\Controllers\StokController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\KategoriController;


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

Route::get('/kategori', [KategoriController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('kategori.index');

Route::get('/kategori/tambah', [KategoriController::class, 'create'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('kategori.create');

Route::post('/kategori', [KategoriController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('kategori.store');

Route::get('/kategori/{kategori}/ubah', [KategoriController::class, 'edit'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('kategori.edit');

Route::put('/kategori/{kategori}', [KategoriController::class, 'update'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('kategori.update');

Route::delete('/kategori/{kategori}', [KategoriController::class, 'destroy'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('kategori.destroy');

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

Route::get('/supplier', [SupplierController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('supplier.index');

Route::get('/supplier/tambah', [SupplierController::class, 'create'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('supplier.create');

Route::post('/supplier', [SupplierController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('supplier.store');

Route::get('/supplier/{supplier}/ubah', [SupplierController::class, 'edit'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('supplier.edit');

Route::put('/supplier/{supplier}', [SupplierController::class, 'update'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('supplier.update');

Route::get('/layanan', [LayananController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.index');

Route::get('/layanan/tambah', [LayananController::class, 'create'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.create');

Route::post('/layanan', [LayananController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.store');

Route::put('/layanan/pengaturan', [LayananController::class, 'updateSetting'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.pengaturan');

Route::get('/layanan/{service}/ubah', [LayananController::class, 'edit'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.edit');

Route::put('/layanan/{service}', [LayananController::class, 'update'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.update');

Route::get('/layanan/{service}/bahan', [LayananController::class, 'bahan'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.bahan');

Route::put('/layanan/{service}/bahan', [LayananController::class, 'updateBahan'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('layanan.bahan.update');

Route::get('/restok', [RestokController::class, 'create'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('restok.create');

Route::post('/restok', [RestokController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('restok.store');

Route::get('/restok/riwayat', [RestokController::class, 'riwayat'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('restok.riwayat');

Route::get('/stok', [StokController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('stok.index');

Route::get('/laporan', [LaporanController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('laporan.index');

Route::get('/kasir/pos', [PosController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:cashier,admin'])
    ->name('kasir.pos');

Route::post('/kasir/pos', [PosController::class, 'store'])
    ->middleware(['auth', 'verified', 'role:cashier,admin'])
    ->name('kasir.pos.store');

Route::get('/kasir/harga', [PosController::class, 'priceList'])
    ->middleware(['auth', 'verified', 'role:cashier,admin'])
    ->name('kasir.harga');

Route::get('/kasir/struk/{sale}', [PosController::class, 'struk'])
    ->middleware(['auth', 'verified', 'role:cashier,admin'])
    ->name('kasir.struk');

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
