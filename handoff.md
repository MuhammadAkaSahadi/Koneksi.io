# 🚀 Koneksi.io - Project Handoff Document

Dokumen ini berfungsi sebagai panduan serah terima (handoff) untuk proyek **Koneksi.io**, sebuah platform kursus digital mandiri (*self-paced learning*) yang berfokus pada IoT, Software, dan Hardware.

---

## 🛠️ Tech Stack & Arsitektur
Proyek ini dibangun menggunakan *stack* teknologi modern:
- **Framework Utama**: Next.js 16.2 (App Router) + React 19
- **Bahasa**: TypeScript
- **Styling & UI**: Tailwind CSS v4, Shadcn UI (berbasis `@base-ui/react`), Lucide React
- **Database & Auth**: Supabase (PostgreSQL), `@supabase/ssr`
- **Payment Gateway**: Midtrans (Snap SDK & Core API Webhook)
- **Email Service**: Resend + `@react-email/components`
- **Data Visualization**: Recharts
- **Video Player**: `react-lite-youtube-embed` (Optimasi *lazy-loading*)

---

## 📂 Struktur Direktori Utama
- `app/` → Semua *Route Handlers* dan antarmuka *Page* Next.js App Router.
  - `(auth)/` → Halaman `login`, `register`, `callback`, dan *Server Actions* untuk autentikasi.
  - `admin/` → Dashboard untuk admin (Melihat metrik dan riwayat transaksi).
  - `dashboard/` → Dashboard untuk pengguna biasa (Melihat progres dan kursus berbayar/lisensi aktif).
  - `katalog/` → Katalog modul kursus (Fitur daftar kursus publik).
  - `checkout/` → Form ringkasan dan integrasi Snap API Midtrans.
  - `player/` → Halaman pemutar video dan interaksi materi (diproteksi dengan *middleware* dan RLS).
  - `api/` → *Route handlers* backend (Pembuatan token Midtrans, Webhook Midtrans, dsb).
- `components/` → Komponen UI (Shadcn), komponen *layout* (Navbar, Footer, UserNav), dan komponen email (Resend).
- `lib/` → Utilitas pihak ketiga seperti instansi klien Midtrans (`snap`).
- `utils/supabase/` → Konfigurasi dan *helper* fungsi untuk *client-side*, *server-side*, dan `middleware.ts` Supabase.
- `migrations/` → *Script* PostgreSQL (`01_users.sql` - `06_security.sql`) yang mengatur struktur tabel dan logika dasar database.

---

## ✅ Fitur yang Tersedia (MVP Selesai)
Seluruh pengerjaan MVP (*Minimum Viable Product*) pada fase ini telah diselesaikan, mencakup:
1. **Sistem Autentikasi (Auth)**:
   - Login, pendaftaran, dan *callback* via Supabase SSR.
   - Manajemen *middleware* untuk memproteksi *route* spesifik (`/dashboard`, `/player`, `/admin`).
2. **Katalog & Navigasi**:
   - *Landing page* dan UI Katalog yang menarik (tema `Tech Blue` dan `Volt Green`).
   - Implementasi komponen asinkron (*Server Components*) untuk penarikan daftar kursus dengan waktu *load* instan.
3. **Player Video Terproteksi**:
   - Player video responsif yang menangani materi Gratis (*Freemium*) dan Berbayar.
   - Hak akses disinkronisasi melalui tabel `enrollments`.
4. **Checkout & Pembayaran (Midtrans)**:
   - Pembelian *lifetime* untuk kursus menggunakan Midtrans Snap.
   - Webhook yang aman (dengan validasi *hash* HMAC SHA-512) guna mengonfirmasi dan membuka akses secara otomatis saat transaksi *Success*.
5. **Notifikasi Transaksional (Resend)**:
   - Pengiriman *receipt email* (Tanda Terima) elegan setelah pembayaran berhasil.
6. **Dashboard Multiperan**:
   - **User**: Pantauan aktivitas melalui statistik grafik (`recharts`) dan akses cepat ke video kursus yang telah dibeli.
   - **Admin**: Peninjauan transaksi pengguna, metrik pendapatan, serta perhitungan total *user*.

---

## 🔑 Environment Variables
Pastikan berkas `.env` atau `.env.local` Anda dilengkapi konfigurasi krusial berikut ini agar *app* berjalan mulus:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # WAJIB untuk bypass RLS (misalnya saat webhook Midtrans atau interaksi server admin)

# Midtrans (Mode Sandbox)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...
MIDTRANS_SERVER_KEY=...

# Resend
RESEND_API_KEY=...
```

---

## 🚦 Cara Menjalankan (*How to Run*)
1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```
2. **Migrasi Supabase**
   - Pastikan bahwa semua skrip `.sql` di folder `migrations/` telah dieksekusi di *SQL Editor* pada Dashboard Supabase Anda secara berurutan.
3. **Jalankan *Development Server***
   ```bash
   npm run dev
   ```
4. **Akses Lokal**
   - Buka `http://localhost:3000` di peramban web Anda.

---

## ⚠️ Peringatan & Limitasi Saat Ini
- **Domain Email Resend**: Jika masih di tahap `Sandbox/On-boarding` dari Resend, email resi pembayaran *hanya bisa* terkirim ke *email address* yang Anda daftarkan/verifikasi di portal Resend.
- **Webhook Lokal Midtrans**: Untuk memvalidasi dan menguji notifikasi pembayaran secara *real-time* di lingkungan lokal, pastikan menggunakan perangkat seperti **Ngrok** atau **Localtunnel** dan arahkan URL Callback Midtrans Anda ke jalur endpoint `/api/webhook/midtrans`.
- **Komponen *Base UI***: Karena kita menggunakan versi terbaru Shadcn berbasis *Base UI*, prop lama seperti `asChild` tidak lagi dipakai. Gantikan polanya menggunakan prop `render` (misal: `render={<Link href="..." />}`).

---
*Dibuat oleh AI Assistant - Proyek diselesaikan dengan sukses! 🎉*
