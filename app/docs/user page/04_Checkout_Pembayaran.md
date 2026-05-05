# HALAMAN 4: CHECKOUT / PEMILIHAN PAKET PEMBAYARAN

## Layout Desktop

### Progress Indicator (Top, height: 80px)
*   Background: #F8F9FA
*   Stepper: 1. Pilih Paket → 2. Pembayaran → 3. Selesai
*   Active step: Tech Blue circle dengan check
*   Inactive: abu-abu outline circle

### Main Content (Padding: 48px vertical)
*   Layout: 2-column (60% kiri, 40% kanan)

#### Kiri: Pilihan Paket (jika belum dipilih di halaman detail)
*   H2: "Pilih Paket Pembelajaran"
*   2 Radio card options (stack vertical, gap 16px):
    *   Card 1: Lifetime
        *   Radio button kiri
        *   Content:
            *   Badge: "REKOMENDASI" (Volt Green)
            *   H3: "Akses Lifetime"
            *   Price: "Rp 199.000" (large, bold)
            *   Features:
                *   ✓ Akses selamanya
                *   ✓ Update gratis
                *   ✓ Download resources
        *   Style: Border 2px (Tech Blue jika selected, #E5E7EB jika tidak)
        *   Background: White, hover background #F8F9FA
    *   Card 2: Subscription
        *   Similar structure
        *   H3: "Langganan 3 Bulan"
        *   Price: "Rp 49.000 /3 bulan"
        *   Features:
            *   ✓ Akses selama periode aktif
            *   ✓ Perpanjang otomatis (bisa dibatalkan)

#### Section: Metode Pembayaran (di bawah pilihan paket)
*   Payment method tabs/buttons:
    *   Transfer Bank
    *   E-Wallet (GoPay, OVO, DANA)
    *   QRIS
    *   Kartu Kredit (jika ada)
*   Layout: Grid 2-3 kolom, icon + label, border, rounded
*   Selected: Border Tech Blue, background light blue

#### Kanan: Order Summary (Sticky card)
*   Background: #F8F9FA, border 1px, rounded-xl, padding 32px
*   Thumbnail tema kecil + judul
*   Divider
*   Breakdown:
    *   Harga paket: Rp 199.000
    *   Diskon (jika ada): -Rp 20.000 (merah)
    *   Subtotal: Rp 179.000 (bold, larger)
*   Divider
*   Promo code input:
    *   Input field + "Terapkan" button (Tech Blue)
*   Divider
*   Total akhir: Rp 179.000 (sangat bold, Tech Blue)
*   Large CTA: "Lanjut ke Pembayaran" (Volt Green, full-width, disabled sampai semua terisi)
*   Trust badges:
    *   Icon secure + "Pembayaran Aman"
    *   Icon refund + "Garansi 7 hari"

#### Form Input (jika perlu data user):
*   Nama lengkap
*   Email
*   Nomor HP
*   Style: Border focus Tech Blue, rounded-lg, padding generous

### Halaman Konfirmasi Pembayaran (Step 2)
*   Instruksi transfer/QRIS
*   QR code jika QRIS (centered, 256px)
*   Countdown timer: "Selesaikan dalam 23:45"
*   Virtual account number (copy button)
*   Upload bukti (jika manual)
*   Status: "Menunggu Pembayaran" (badge orange)

### Halaman Sukses (Step 3)
*   Centered content
*   Icon success (check circle besar, Volt Green)
*   H2: "Pembayaran Berhasil!"
*   Message: "Akses kursus sudah aktif"
*   CTA: "Mulai Belajar Sekarang" (Volt Green)
*   Secondary: "Lihat Invoice"

---

## Layout Mobile
*   Stack single column
*   Order summary tidak sticky, collapse ke bottom bar dengan total + CTA
*   Payment methods stack vertical
*   Stepper jadi compact horizontal indicator