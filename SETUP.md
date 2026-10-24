\# Setup TRIPOS di komputer kamu



Panduan ini untuk anggota kelompok yang ingin menjalankan proyek TRIPOS di laptop sendiri.



\## Yang perlu disiapkan

\- Laragon (PHP 8.3, MySQL 8.4)

\- Git

\- Node.js versi LTS

\- Akun GitHub yang sudah diundang ke repo `same-self/tripos`



\## Langkah



1\. \*\*Ambil proyek dari GitHub.\*\* Buka Terminal di Laragon, lalu jalankan:

&#x20;  ```

&#x20;  cd C:\\laragon\\www

&#x20;  git clone https://github.com/same-self/tripos.git

&#x20;  cd tripos

&#x20;  git checkout main

&#x20;  git pull

&#x20;  ```



2\. \*\*Buat file `.env`\*\* dari contohnya:

&#x20;  ```

&#x20;  copy .env.example .env

&#x20;  ```

&#x20;  Jangan pernah meng-upload file `.env` ke GitHub. Git sudah mengabaikannya.



3\. \*\*Install paket PHP dan JavaScript:\*\*

&#x20;  ```

&#x20;  composer install

&#x20;  npm install --legacy-peer-deps

&#x20;  ```

&#x20;  Perintah npm wajib memakai `--legacy-peer-deps`. Tanpa itu, instalasi gagal karena konflik versi Vite.



4\. \*\*Buat kunci aplikasi dan build tampilan:\*\*

&#x20;  ```

&#x20;  php artisan key:generate

&#x20;  npm run build

&#x20;  ```



5\. \*\*Buat database\*\* bernama `tripos` lewat HeidiSQL (dari Laragon) atau menu Database di Laragon.



6\. \*\*Buat tabel dan isi akun awal:\*\*

&#x20;  ```

&#x20;  php artisan migrate

&#x20;  php artisan db:seed

&#x20;  ```



7\. \*\*Jalankan server:\*\*

&#x20;  ```

&#x20;  php artisan serve

&#x20;  ```

&#x20;  Buka `http://127.0.0.1:8000/login`.



&#x20;  Akun demo: username `admin.toko`, password `admin123`.

&#x20;  Akun ini hanya untuk percobaan di komputer sendiri.



\## Cara bekerja di tim

\- Jangan langsung bekerja di `main`. Buat branch baru:

&#x20; ```

&#x20; git checkout -b nama-fitur

&#x20; ```

\- Setelah selesai, simpan perubahan, upload branch-nya, lalu buat pull request di GitHub.

\- Setelah pull request di-merge, jalankan `git checkout main` dan `git pull`.

\- Setelah `git pull`, jalankan lagi `npm install --legacy-peer-deps` jika ada perubahan di `package.json`.



\## Jika ada masalah

\- Pastikan MySQL di Laragon sudah berjalan.

\- Pastikan nama database di `.env` adalah `tripos`.

\- Jika `npm install` gagal, cek lagi bahwa kamu memakai `--legacy-peer-deps`.

\- Jika login gagal, jalankan `php artisan db:seed` lagi, lalu coba masuk dengan akun demo.

\- Tanyakan di grup sebelum mengubah `.env` atau mengunggah file yang tidak kamu pahami.



