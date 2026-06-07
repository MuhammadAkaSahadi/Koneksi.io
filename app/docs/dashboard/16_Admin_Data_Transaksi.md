# Admin - Data Transaksi

## 1. Ikhtisar (Overview)
Halaman **Data Transaksi** merupakan rekapitulasi dari seluruh pembayaran dan pembelian modul yang dilakukan oleh pengguna *Koneksi.io*. Admin dapat melacak status pembayaran, melakukan verifikasi manual, dan mengunduh laporan keuangan.

## 2. Struktur Tata Letak (Layout Structure)
- **Header Section:** Judul halaman ("Data Transaksi") beserta tombol "Download Laporan (CSV/Excel)".
- **Summary Widgets (Ringkasan Metrik):** Tiga atau empat *cards* di bagian atas:
  - Total Pendapatan (Bulan Ini)
  - Transaksi Berhasil
  - Menunggu Pembayaran (Pending)
  - Transaksi Gagal/Expired
- **Tab Navigation:** Segmentasi data tabel berdasarkan status (`Semua`, `Menunggu Verifikasi`, `Sukses`, `Gagal`).
- **Main Content (Data Table):** Tabel riwayat transaksi.

## 3. Komponen Utama (Core Components)

### A. Tabel Riwayat Transaksi
Kolom yang ditampilkan:
1. **ID Transaksi:** Nomor resi/invoice unik (misal: `INV-202310-001`).
2. **Tanggal:** Tanggal dan waktu transaksi dilakukan.
3. **Detail Pembeli:** Nama pengguna & Modul yang dibeli.
4. **Metode Pembayaran:** Logo/nama bank atau metode (contoh: BCA Virtual Account, e-Wallet, Transfer Manual).
5. **Total Tagihan:** Nominal harga dalam Rupiah (Rp).
6. **Status:** Badge dinamis (`Sukses` - Hijau, `Pending` - Kuning, `Menunggu Verifikasi` - Biru, `Gagal` - Merah).
7. **Aksi:** Tombol untuk melihat detail/invoice dan verifikasi.

### B. Panel Detail Transaksi (Side Drawer)
Ketika baris transaksi diklik, panel dari kanan (*side drawer*) akan muncul menampilkan:
- Rincian Invoice lengkap.
- Bukti transfer (jika metode pembayaran adalah transfer manual).
- Tombol aksi: `Verifikasi Pembayaran` (Terima) atau `Tolak Pembayaran`.

## 4. Interaksi & Perilaku (Interactions & Behaviors)
- **Filter Berdasarkan Rentang Waktu:** Tersedia *Date Picker* untuk memfilter transaksi (Hari ini, 7 Hari Terakhir, Bulan Ini, atau Kustomisasi Tanggal).
- **Verifikasi Manual:** Jika Admin menekan tombol `Verifikasi Pembayaran`, status transaksi otomatis berubah menjadi `Sukses` dan sistem mengirimkan email konfirmasi ke pengguna bahwa modul sudah dapat diakses.
- **Export Data:** Menekan tombol "Download Laporan" akan memicu sistem menyiapkan file CSV/XLSX. Tombol akan menunjukkan *loading spinner* (Generating...) hingga file siap diunduh.