# Admin - Kelola Modul

## 1. Ikhtisar (Overview)
Halaman **Kelola Modul** adalah pusat kendali bagi Administrator untuk mengatur semua materi pembelajaran (modul) yang tersedia di platform *Koneksi.io*. Melalui halaman ini, Admin dapat melihat daftar modul, menambahkan modul baru, mengubah detail, hingga menghapus modul yang sudah tidak relevan.

## 2. Struktur Tata Letak (Layout Structure)
- **Header Section:** Menampilkan judul halaman ("Kelola Modul") dan sebuah tombol aksi utama (Primary Button) `+ Tambah Modul Baru`.
- **Search & Filter Bar:** - *Search Input:* Untuk mencari modul berdasarkan nama atau ID.
  - *Dropdown Filter:* Berdasarkan kategori modul dan status publikasi (Draft, Published, Archived).
- **Main Content (Data Table):** Tabel responsif yang menampilkan daftar modul secara komprehensif.
- **Pagination:** Kontrol navigasi di bagian bawah tabel untuk memuat data per halaman (10/20/50 baris per halaman).

## 3. Komponen Utama (Core Components)

### A. Tabel Daftar Modul
Tabel memiliki kolom-kolom berikut:
1. **ID Modul:** Identifier unik (misal: `MOD-001`).
2. **Nama Modul:** Judul utama dari kursus/modul.
3. **Kategori:** Kategori pembelajaran (misal: UI/UX, Web Development).
4. **Harga:** Harga modul (Gratis atau berbayar).
5. **Status:** Badge indikator status (`Published` - Hijau, `Draft` - Kuning, `Archived` - Abu-abu).
6. **Aksi:** Kumpulan tombol ikon (Edit, Lihat Detail, Hapus).

### B. Modal "Tambah/Edit Modul"
Formulir *slide-over* atau *pop-up modal* yang berisi field:
- **Nama Modul:** Text input (Wajib).
- **Deskripsi:** Rich text editor (Wajib).
- **Thumbnail Modul:** Area drag-and-drop file upload untuk gambar cover (JPG/PNG).
- **Kategori:** Dropdown select.
- **Tipe Harga:** Radio button (Gratis / Berbayar).
- **Harga (Rp):** Number input (Aktif jika Tipe Harga = Berbayar).

## 4. Interaksi & Perilaku (Interactions & Behaviors)
- **Hover States:** Baris tabel akan berubah warna latar (*light grey*) saat di-hover. Tombol aksi memunculkan *tooltip*.
- **Delete Action:** Menekan tombol 'Hapus' akan memicu *Confirmation Dialog* ("Apakah Anda yakin ingin menghapus modul ini? Tindakan ini tidak dapat dibatalkan.").
- **Empty State:** Jika tidak ada modul yang ditemukan, tabel akan digantikan oleh ilustrasi "Belum ada data modul" beserta tombol CTA untuk membuat modul.
- **Toast Notifications:** Muncul notifikasi *snackbar/toast* sukses di sudut kanan atas setelah modul berhasil disimpan, diperbarui, atau dihapus.