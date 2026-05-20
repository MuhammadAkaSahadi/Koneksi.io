# Membangun Koneksi.io

Ini adalah rencana implementasi menyeluruh (roadmap) untuk membangun **Koneksi.io**, platform kursus digital mandiri (self-paced learning) untuk IoT, Software, & Hardware. Rencana ini disusun berdasarkan visi proyek, stack teknologi yang diwajibkan, serta pedoman desain dan arsitektur yang Anda berikan.

## User Review Required

> [!IMPORTANT]
> Mohon tinjau roadmap di bawah ini. Jika Anda setuju, kita bisa mulai mengeksekusi **Fase 1** untuk mengatur fondasi proyek dan menginstal seluruh dependensi.

## Open Questions

> [!NOTE]
> 1. Apakah Anda sudah membuat project di Supabase (beserta URL dan Anon Key) untuk kita hubungkan ke `.env` nantinya?
> 2. Apakah Anda sudah memiliki kunci API Midtrans dan Resend untuk keperluan testing (sandbox)?
> 3. Apakah Anda lebih memilih menggunakan `npx shadcn-ui@latest init` untuk menginisiasi komponen UI, atau ada konfigurasi khusus yang ingin diterapkan terlebih dahulu?

## Proposed Changes (Roadmap Implementasi)

Berikut adalah tahapan iteratif untuk membangun Koneksi.io dengan aman, modular, dan sesuai standar performa:

### Fase 1: Fondasi Proyek & Desain Sistem
- **Dependensi Utama**: Menginstal `lucide-react`, `zustand`, `react-hook-form`, `zod`, `clsx`, `tailwind-merge`, dll.
- **Konfigurasi UI**: Mengadaptasi palet warna (Tech Blue, Volt Green), tipografi (Plus Jakarta Sans/Inter), dan komponen dasar dari `00_Design_System_Foundation.md` ke dalam `tailwind.config.ts` dan `globals.css`.
- **Inisialisasi Shadcn UI**: Menambahkan komponen dasar yang sering dipakai (Button, Input, Card, Toast/Sonner).

### Fase 2: Konfigurasi Supabase & Autentikasi
- **Klien Supabase**: Setup `@supabase/ssr` untuk Server Components, Client Components, dan Route Handlers.
- **Auth Flow**: Implementasi Supabase Auth (Email/Password & Google OAuth).
- **Proteksi Rute**: Membangun `middleware.ts` Next.js untuk memproteksi halaman kursus/player video agar hanya bisa diakses oleh user yang telah login dan memiliki akses (berdasarkan status pembayaran freemium/premium).
- **RLS**: Memastikan kebijakan keamanan tingkat baris (Row Level Security) diterapkan di database.

### Fase 3: Halaman Publik & Katalog Kursus
- **Landing Page**: Membuat Hero section, keunggulan fitur, dan komponen testimoni.
- **Katalog Kursus**: Menampilkan grid kursus dengan label harga (Lifetime/Subscription) dan integrasi fetching data dari Supabase via Server Component.
- **Detail Tema**: Halaman detail kursus publik (sebelum masuk ke player).

### Fase 4: Player Video & Checkout (Midtrans)
- **Video Player**: Membuat UI player dengan sidebar navigasi (materi gratis vs terkunci) dan integrasi `lite-youtube-embed` untuk performa tinggi.
- **Checkout Flow**: Membangun form checkout dan mengintegrasikan Midtrans Snap SDK/Core API untuk memproses pembayaran (per tema atau subscription).
- **Webhook Midtrans**: Endpoint untuk menerima notifikasi dari Midtrans (Success/Pending/Failed) dan memperbarui akses kursus pengguna di Supabase.

### Fase 5: Notifikasi Email (Resend) & Dashboards
- **Email Resend**: Mengonfigurasi React Email & Resend untuk mengirimkan notifikasi pembelian sukses.
- **User Dashboard**: Membangun halaman ringkasan progres menggunakan grafik `recharts` dan manajemen profil pengguna.
- **Admin Dashboard**: Membangun antarmuka admin untuk melihat metrik penjualan, manajemen konten, serta tabel riwayat transaksi secara real-time.

---

## Verification Plan

### Automated Tests & Linting
- Menjalankan `npm run lint` dan `npm run build` di setiap akhir fase untuk mendeteksi error Typescript/Next.js.

### Manual Verification
- **Testing Auth**: Melakukan simulasi daftar/login menggunakan email dan Google.
- **Testing Middleware**: Menguji akses ke halaman terkunci menggunakan akun tanpa akses untuk memastikan *redirect* berfungsi.
- **Testing Video Player**: Memastikan `lite-youtube-embed` memuat thumbnail dengan cepat dan hanya memutar video setelah interaksi.
- **Testing Payment Sandbox**: Melakukan transaksi menggunakan kartu kredit tiruan Midtrans untuk memastikan webhooks merespons dan mengubah status akses kursus di database.
