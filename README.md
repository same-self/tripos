# TRIPOS — Point of Sale & Store Management System

<p align="center">
  <strong>Solusi Point of Sale (POS) dan Manajemen Toko Terintegrasi untuk UMKM Fotocopy Trisanet</strong>
  <br>
  <em>Cipeucang, Cileungsi, Kab. Bogor</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Lucide_Icons-1.x-F97316?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide Icons">
  <img src="https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Tests-71%20Passed-10B981?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Tests">
</p>

---

## 📌 Tentang TRIPOS

**TRIPOS** adalah sistem *Point of Sale* (POS) modern berbasis web yang dirancang khusus untuk memfasilitasi operasional bisnis retail alat tulis kantor (ATK) sekaligus layanan percetakan/jasa fotokopi pada UMKM Fotocopy Trisanet.

Berbeda dengan sistem POS retail biasa, TRIPOS menghubungkan **penjualan jasa fotokopi/print** dengan **pengurangan stok bahan baku secara otomatis** (misalnya: cetak 10 lembar otomatis memotong stok 10 lembar kertas HVS A4). Sistem ini juga dilengkapi rekomendasi restok berbasis analisis kecepatan perputaran barang (*fast/slow-moving goods*) serta pembagian hak akses (*Role-Based Access Control*) antara Admin dan Kasir.

---

## ✨ Fitur Unggulan

### 1. 🛒 Layar Kasir / POS (`/kasir/pos`)
* **Visual Aid & Thumbnail Produk**: Setiap kartu produk dilengkapi foto produk asli dengan fallback icon kategori.
* **Kategori & Pencarian Instan**: Navigasi cepat antara tab *Barang ATK* dan *Jasa Fotokopi*, lengkap dengan kolom pencarian real-time.
* **Keranjang Interaktif**:
  * Pengubahan kuantitas langsung secara numerik (*direct inline typing*) maupun tombol stepper `−` / `+`.
  * Tombol hapus item keranjang dengan visual yang jelas (`Trash2`).
* **Metode Pembayaran**: Mendukung pembayaran Tunai (dengan hitung kembalian dan tombol nominal pas) serta QRIS.
* **Cetak Struk Thermal**: Format struk standar 58mm/80mm yang kompatibel dengan browser print (`window.print()`).
* **Daftar Harga Cepat (`/kasir/harga`)**: Fitur pencarian tarif harga barang dan jasa instan hanya dengan menekan tombol `/` pada keyboard.

### 2. 📦 Manajemen Barang & Gambar (`/barang`)
* **Upload Foto Produk**: Mendukung unggah gambar (JPG, PNG, WEBP maks. 2 MB) dengan preview interaktif langsung di form.
* **Summary Info Cards**: 4 kartu ringkasan di bagian atas katalog:
  * Total jenis barang
  * Jumlah stok menipis (*low stock warning*)
  * Total nilai kapitalisasi stok (harga modal)
  * Total kategori aktif
* **Filter & Pencarian**: Filter produk berdasarkan kategori dan pencarian nama produk secara real-time.
* **Guarded Soft Delete**: Mencegah penghapusan barang yang masih terdaftar sebagai bahan baku aktif pada layanan/jasa untuk mencegah rusaknya data transaksi.

### 3. 🛠️ Layanan & Manajemen Bahan Baku (`/layanan`)
* **Katalog Jasa**: Pengelolaan jasa fotokopi, print laser, jilid spiral/hardcover, dan banner.
* **Komposisi Bahan ("Resep Layanan")**: Pengaturan proporsi bahan baku yang dikonsumsi per satuan layanan.
* **Auto-Deduct Setting**: Switch otomatis untuk memotong stok bahan baku saat transaksi kasir tersimpan.
* **Soft Delete**: Data penjualan masa lalu tetap utuh dan menampilkan nama layanan meskipun layanan dinonaktifkan.

### 4. 🏷️ Kategori Berwarna & Terproteksi (`/kategori`)
* **Identitas Visual**: Badge kategori dilengkapi palet warna dan ikon khusus Lucide (Alat Tulis, Kertas, Buku, Aksesoris, Jilid, Banner, dll.).
* **Proteksi Integritas**: Kategori yang masih menaungi produk tidak dapat dihapus sembarangan sebelum produknya dipindahkan.

### 5. 🚚 Supplier & Riwayat Restok (`/supplier` & `/restok`)
* **Manajemen Pemasok**: Pencatatan kontak, telepon, dan alamat pemasok ATK.
* **Riwayat Pembelian Tetap Terbaca**: Penghapusan supplier menggunakan sistem soft-delete sehingga nota pembelian masa lalu tetap menampilkan nama supplier.
* **Pencatatan Restok**: Input multi-barang pembelian dengan mutasi stok otomatis bertambah.

### 6. 📊 Stok & Rekomendasi Restok (`/stok`)
* **Klasifikasi Produk**:
  * 🟢 **Cepat Laku** (*Fast Moving*)
  * ⚪ **Normal**
  * 🟡 **Lambat** (*Slow Moving*)
* **Rekomendasi Cerdas**: Kartu *Restok Segera* dan *Restok Nanti* yang dihitung dari kecepatan penjualan barang pada periode tertentu.

### 7. 📈 Laporan Keuangan & Ekspor (`/laporan`)
* **Tabulasi Komprehensif**:
  * Rekap Penjualan Harian
  * Pembelian / Restok
  * Arus Kas Bersih (*Net Cash Flow*)
  * Barang Terlaris & Paling Lambat
  * Estimasi Keuntungan Kotor
* **Ekspor Laporan**: Fitur cetak/simpan PDF bersih khusus laporan dengan format ramah cetak.

### 8. 👥 Pengguna & Keamanan (`/pengguna`)
* **Peran (Roles)**: `admin` (akses penuh ke backoffice & POS) dan `cashier` (akses khusus layar kasir).
* **Guarded User Deletion**: Akun yang sudah memiliki riwayat penjualan atau pembelian dilindungi dari penghapusan permanen (hanya dapat dinonaktifkan) untuk menjaga validitas pembukuan.
* **Paksa Ganti Password**: Kasir baru diwajibkan mengganti password sementara saat pertama kali login.

---

## 🏗️ Arsitektur & Teknologi

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Backend Framework** | [Laravel 12.x](https://laravel.com) | PHP 8.3+, Eloquent ORM, Form Requests, SoftDeletes |
| **Frontend Adapter** | [Inertia.js 2.x](https://inertiajs.com) | Modern Monolith (SPA experience tanpa REST API overhead) |
| **Frontend UI** | [React 18](https://react.dev) | Komponen modular, UI reaktif, form hooks |
| **Styling** | [Tailwind CSS 3.x](https://tailwindcss.com) | Utility-first CSS, responsive layout, custom theme |
| **Icon Library** | [Lucide React](https://lucide.dev) | Ikon SVG modern, ringan, dan konsisten |
| **Bundler** | [Vite 8.x](https://vitejs.dev) | Hot Module Replacement (HMR) super cepat |
| **Database** | [MySQL 8.4+](https://mysql.com) | Relasi kuat dengan Foreign Key dan Soft Deletes |
| **Testing** | PHPUnit & Selenium | 71 Feature/Unit Tests + E2E browser testing |

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat
* **PHP** versi 8.2 atau 8.3 (dengan ekstensi `pdo_mysql`, `mbstring`, `fileinfo`, `gd`/`imagick`, `curl`)
* **Composer** versi 2.x
* **Node.js** versi LTS (v18, v20, atau v22) & npm
* **MySQL** versi 8.0+ atau MariaDB 10.4+ (dapat menggunakan **Laragon** atau XAMPP)

### Langkah-langkah

1. **Clone repositori**:
   ```bash
   git clone https://github.com/same-self/tripos.git
   cd tripos
   ```

2. **Salin environment file**:
   ```bash
   cp .env.example .env
   # Atau di Windows Command Prompt / PowerShell:
   copy .env.example .env
   ```

3. **Install dependensi PHP & Node.js**:
   ```bash
   composer install
   npm install --legacy-peer-deps
   ```
   > *Catatan: Gunakan `--legacy-peer-deps` saat menjalankan npm install.*

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Konfigurasi Database**:
   Buka file `.env`, lalu pastikan pengaturan database sesuai dengan lingkungan lokal Anda:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=tripos
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   *Buat database kosong bernama `tripos` di MySQL/HeidiSQL jika belum ada.*

6. **Migrasi Database & Seeder**:
   ```bash
   php artisan migrate --seed
   ```

7. **Hubungkan Storage Link**:
   Perintah ini wajib dijalankan agar gambar produk yang diunggah dapat diakses oleh browser:
   ```bash
   php artisan storage:link
   ```

8. **Build Aset Frontend**:
   ```bash
   npm run build
   ```

9. **Jalankan Aplikasi**:
   ```bash
   php artisan serve
   ```
   Buka browser dan akses: [http://127.0.0.1:8000](http://127.0.0.1:8000) (atau `http://tripos.test` jika menggunakan Laragon virtual host).

---

## 🔑 Kredensial Demo Awal

Setelah menjalankan `php artisan migrate --seed`, akun berikut siap digunakan:

| Peran | Username | Password Awal | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin (Pemilik Toko)** | `admin.toko` | `admin1234` | Akses penuh: Dashboard, Katalog, Laporan, Pengguna, dll. |
| **Kasir** | `kasir.baru` | `kasir1234` | Masuk langsung ke layar POS (`/kasir/pos`) |
| **Kasir (Default Seeder)** | `kasir.toko` | `password` | Diminta ganti password pada login pertama |

---

## 🧪 Pengujian & Quality Assurance

TRIPOS dilengkapi dengan pengujian otomatis untuk memastikan integritas logika bisnis:

```bash
# Menjalankan seluruh unit test dan feature test backend
php artisan test
```

**Hasil Pengujian Saat Ini:**
```text
   PASS  Tests\Feature\Auth\AuthenticationTest
   PASS  Tests\Feature\Auth\EmailVerificationTest
   PASS  Tests\Feature\Auth\PasswordConfirmationTest
   PASS  Tests\Feature\Auth\PasswordResetTest
   PASS  Tests\Feature\Auth\PasswordUpdateTest
   PASS  Tests\Feature\Auth\RegistrationTest
   PASS  Tests\Feature\DashboardPageTest
   PASS  Tests\Feature\ExampleTest
   PASS  Tests\Feature\Pos\PurchaseServiceTest
   PASS  Tests\Feature\Pos\ReportServiceTest
   PASS  Tests\Feature\Pos\RoleMiddlewareTest
   PASS  Tests\Feature\Pos\SaleServiceTest
   PASS  Tests\Feature\Pos\SeedersTest
   PASS  Tests\Feature\Pos\StockServiceTest
   PASS  Tests\Feature\ProfileTest

   Tests:    71 passed (278 assertions)
   Duration: 7.27s
```

---

## 📂 Struktur Direktori Utama

```text
tripos/
├── app/
│   ├── Enums/            # Enum class (Role, PaymentMethod)
│   ├── Http/
│   │   ├── Controllers/  # Controller POS, Barang, Layanan, Kategori, Laporan, dll.
│   │   └── Middleware/   # Role-based access control & password change enforcement
│   ├── Models/           # Eloquent Models (Item, Service, Sale, Supplier, User, dll.)
│   └── Services/         # Business logic layer (SaleService, StockService, ReportService)
├── database/
│   ├── migrations/       # Skema database & penambahan kolom image_path
│   └── seeders/          # Data awal pengguna, setting, dan katalog sampel
├── public/
│   └── storage/          # Symlink ke storage/app/public untuk file gambar
├── resources/
│   ├── js/
│   │   ├── Components/   # Reusable UI (ItemThumb, CategoryBadge, EditButton, dll.)
│   │   ├── Layouts/      # TriposLayout (Admin) & CashierLayout (POS)
│   │   └── Pages/        # Inertia React views (Dashboard, Pos, Barang, Layanan, dll.)
│   └── css/              # Tailwind stylesheets
├── routes/
│   ├── web.php           # Definisi route aplikasi yang terproteksi role
│   └── auth.php          # Route autentikasi Laravel Breeze
└── tests/
    └── Feature/          # Suite test Laravel
```

---

## 🤝 Alur Kolaborasi Tim (Git Workflow)

1. Pastikan selalu memperbarui branch `main`:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Buat branch fitur baru sebelum menulis kode:
   ```bash
   git checkout -b nama-fitur-kamu
   ```
3. Commit dan push branch ke GitHub:
   ```bash
   git add .
   git commit -m "Deskripsi singkat dan jelas mengenai perubahan"
   git push -u origin nama-fitur-kamu
   ```
4. Buka **Pull Request (PR)** di repositori GitHub untuk direview dan dimerge ke `main`.

---

## 📄 Lisensi

Aplikasi ini dikembangkan untuk UMKM Fotocopy Trisanet sebagai bagian dari proyek akademik. Hak cipta dilindungi di bawah lisensi terbuka [MIT License](LICENSE).
