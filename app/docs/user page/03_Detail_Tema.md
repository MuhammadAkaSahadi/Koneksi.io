# HALAMAN 3: DETAIL TEMA (Silabus + Player Video Freemium)

## Layout Desktop

### Hero/Header (Height: auto, padding 64px vertical)
*   Background: Gradient Tech Blue subtle
*   Breadcrumb: Home > Katalog > [Nama Tema]
*   Layout: 2-column (65% kiri, 35% kanan)
*   Konten Kiri:
    *   Badge: "Hardware (IoT)" + "Freemium"
    *   H1: Nama tema lengkap
    *   Subtitle: 2-3 kalimat deskripsi value
    *   Meta indicators row:
        *   Level: Pemula
        *   Durasi: ~8 jam
        *   Sub-bab: 12
        *   Bahasa: Indonesia
    *   Instructor info (jika ada): Avatar + nama
*   Konten Kanan (Sticky card saat scroll):
    *   Pricing Card (background white, shadow, rounded-xl, padding 32px):
        *   Preview thumbnail video
        *   Badge: "2 Sub-bab Gratis untuk Dicoba"
        *   Harga besar: "Rp 199.000" (strike jika diskon)
        *   Label: "Akses Lifetime"
        *   Divider
        *   Opsi alternatif: "Rp 49.000/3 bulan" (checkbox untuk switch)
        *   Feature checklist:
            *   ✓ 12 sub-bab video HD
            *   ✓ Project files & resources
            *   ✓ Sertifikat penyelesaian
            *   ✓ Update gratis selamanya (jika lifetime)
        *   Large CTA: "Mulai Belajar Gratis" (Volt Green, full-width)
        *   Small text: "Atau beli sekarang untuk akses penuh"

### Tab Navigation (Sticky setelah hero, height: 56px)
*   Background: White, shadow
*   Tabs: "Silabus" | "Tentang" | "Ulasan" | "FAQ"
*   Active: Border bottom 3px Volt Green

### Silabus Section (Tab default aktif)
*   Layout: Single column, max-width 800px
*   Setiap Module (Accordion style):
    *   Header bar:
        *   Icon expand/collapse
        *   Title: "Modul 1: Pendahuluan IoT"
        *   Meta: "3 sub-bab • 45 menit"
        *   Badge: "GRATIS" (Volt Green) jika sub-bab 1-2
    *   Expanded content:
        *   List sub-bab:
            *   Checkbox (checked jika selesai)
            *   Icon video + durasi
            *   Judul sub-bab
            *   Lock icon (abu-abu) jika premium, unlock (Volt Green) jika gratis
        *   Hover: Background #F8F9FA, cursor pointer untuk yang unlocked
    *   Style:
        *   Background: White
        *   Border: 1px #E5E7EB
        *   Rounded-lg
        *   Margin bottom 16px

### Video Player Modal/Embed (Saat klik sub-bab gratis):
*   Fullscreen overlay atau embedded di halaman
*   Player: Custom dengan brand color (controls Tech Blue)
*   Next lesson suggestion di akhir video
*   Jika klik locked lesson: Modal CTA pembelian

### Tentang Tab:
*   Rich text editor content
*   Apa yang dipelajari (bullet points dengan icon check Volt Green)
*   Persyaratan (jika ada)
*   Target audience

### Ulasan Tab:
*   Rating aggregate (stars + angka)
*   Filter: Semua | 5 bintang | 4 bintang, dll.
*   Review cards dengan avatar, nama, rating, tanggal, teks

### FAQ Tab:
*   Accordion questions khusus tema ini

---

## Layout Tablet
*   Hero jadi stack vertical
*   Pricing card tidak sticky, di bawah hero
*   Silabus full-width

---

## Layout Mobile
*   Stack penuh
*   Pricing card sticky di bottom (collapse ke bar minimal dengan harga + CTA "Beli")
*   Tap untuk expand full pricing detail
*   Tabs jadi horizontal scroll chips