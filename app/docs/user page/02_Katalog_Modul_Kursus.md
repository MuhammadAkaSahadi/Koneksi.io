# HALAMAN 2: KATALOG MODUL KURSUS IoT

## Layout Desktop

### Header Section (Height: 240px)
*   Background: Gradient Tech Blue (darker top, lighter bottom)
*   Breadcrumb: Home > Katalog (putih, opacity 80%)
*   H1 putih: "Katalog Pembelajaran"
*   Tab switcher: "Software" | "Hardware (IoT)" (pill-style, aktif Volt Green)

### Filter & Search Bar (Sticky di scroll, height: 80px)
*   Background: White, shadow saat sticky
*   Layout: Flex horizontal
    *   Search box kiri (40% width): Icon search, placeholder "Cari tema atau teknologi..."
    *   Filter pills kanan: "Semua Level" | "Gratis" | "Lifetime" | "Subscription" (chip-style, multi-select)
*   Border bottom: 1px #E5E7EB

### Main Content Area (Padding: 48px vertical)
*   Layout: 3-column grid (gap 24px)
*   Setiap Course Card:
    *   Aspect ratio: 4:3 untuk thumbnail
    *   Thumbnail: Image tema dengan overlay gradient bottom
    *   Badge overlay kiri atas: "FREEMIUM" (Volt Green, rounded-full, bold, 12px)
    *   Content area (padding 24px):
        *   Category tag: "IoT" (Tech Blue light background, small)
        *   H3 Title: Nama tema (mis: "IoT Fundamentals with ESP32")
        *   Meta row:
            *   Icon modules + "12 sub-bab"
            *   Icon duration + "~8 jam"
        *   Progress indicator: "2 sub-bab gratis" (Volt Green text, icon unlock)
        *   Divider line
        *   Price row:
            *   "Rp 199.000 Lifetime" (bold)
            *   atau "Rp 49.000/3 bulan" (secondary)
        *   CTA Button: "Lihat Detail" (outline Tech Blue, full-width, rounded-lg)
    *   Card style:
        *   Background white
        *   Border: 1px #E5E7EB
        *   Rounded-xl (12px)
        *   Hover: Border Tech Blue (2px), shadow enhance, subtle scale (1.02)

### Empty State (jika tidak ada hasil):
*   Centered illustration (256px)
*   H3: "Tidak menemukan tema yang cocok"
*   Suggestion: Reset filter atau eksplorasi kategori lain

---

## Layout Tablet
*   Grid 2-kolom
*   Filter pills wrap ke baris kedua jika perlu

---

## Layout Mobile
*   Search full-width di atas
*   Filter horizontal scroll chips
*   Grid 1-kolom stack
*   Card lebih kompak (padding 16px)