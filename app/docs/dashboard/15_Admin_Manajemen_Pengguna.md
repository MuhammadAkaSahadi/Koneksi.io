# Admin - Manajemen Pengguna

## 1. Ikhtisar (Overview)
Halaman **Manajemen Pengguna** digunakan oleh Admin untuk memonitor, mengelola hak akses, dan memelihara data pengguna (Siswa, Instruktur, maupun Admin lainnya) yang terdaftar di *Koneksi.io*.

## 2. Struktur Tata Letak (Layout Structure)
- **Header Section:** Menampilkan judul halaman ("Manajemen Pengguna") serta statistik ringkas di bagian atas (Total Pengguna, Pengguna Aktif Hari Ini, Pengguna Baru Minggu Ini).
- **Search & Filter Bar:** - *Search Input:* Pencarian berdasarkan Nama, Email, atau ID Pengguna.
  - *Role Filter:* Dropdown (Semua Role, Admin, Siswa).
  - *Status Filter:* Dropdown (Aktif, Inaktif, Banned).
- **Main Content (Data Table):** Tabel daftar pengguna.
- **Pagination:** Navigasi halaman tabel.

## 3. Komponen Utama (Core Components)

### A. Tabel Daftar Pengguna
Kolom yang tersedia di dalam tabel:
1. **Profil:** Avatar kecil beserta Nama Lengkap dan Email di bawahnya.
2. **Role:** Label peran pengguna (Siswa, Admin).
3. **Tanggal Bergabung:** Format tanggal (DD MMM YYYY).
4. **Aktivitas Terakhir:** Menunjukkan kapan user terakhir login (contoh: "2 jam yang lalu").
5. **Status Akun:** Badge indikator (`Aktif` - Hijau, `Inaktif` - Abu-abu, `Banned` - Merah).
6. **Aksi:** Ikon *kebab menu* (tiga titik vertikal) untuk aksi tambahan.

### B. Dropdown Aksi (Kebab Menu)
Saat tombol aksi diklik, akan muncul menu *dropdown* dengan pilihan:
- **Lihat Profil:** Membuka halaman detail aktivitas pengguna.
- **Ubah Role:** Mengganti peran pengguna (misal dari Siswa menjadi Admin).
- **Reset Password:** Mengirimkan email tautan reset kata sandi kepada pengguna.
- **Banned/Suspend:** Menonaktifkan akses pengguna ke platform.

## 4. Interaksi & Perilaku (Interactions & Behaviors)
- **Toggle Status:** Admin dapat dengan cepat menonaktifkan akun dengan mengklik *toggle switch* (jika diaktifkan pada pengaturan tabel).
- **Bulk Actions:** Tersedia *checkbox* di setiap baris tabel untuk melakukan aksi massal, seperti "Hapus Beberapa Pengguna" atau "Kirim Pengumuman Email".
- **Confirmation Modals:** Setiap aksi destruktif (seperti Banned akun) memerlukan konfirmasi eksplisit dari Admin dengan mengetikkan alasan *banned*.