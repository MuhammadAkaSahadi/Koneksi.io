# KOMPONEN UTAMA DASHBOARD

## KOMPONEN 3: MAIN CONTENT AREA (Kanan)
*   **Container Style:** Background #F8FAFC, Padding 32px, Offset Top 56px (jika banner ada).
*   **Header Section:**
    *   Kiri (Greeting & Page Title): "Halo, [Nama User] 👋" + H1 "Dashboard".
    *   Kanan: Date/Time Indicator (Senin, 5 Mei 2026 + Icon calendar).

## KOMPONEN 4: TOP STATS WIDGET (Grid 4 Kolom)
*   **Layout Desktop:** Grid 4-column, gap 24px.
*   **Single Stat Card Style:** Background #FFFFFF, Border 1px #E2E8F0, Rounded 12px, Padding 24px. Hover border Tech Blue 30%.
*   **Card Content Structure:**
    *   **Card 1 (Status Paket):** Icon package, Label "Status Paket", Value Badge (Volt Green untuk Lifetime, Light Tech Blue untuk Langganan).
    *   **Card 2 (Total Kelas):** Icon layers indigo, Angka stat besar (Plus Jakarta Sans 36px), Sub-text "modul aktif".
    *   **Card 3 (Sedang Berjalan):** Icon clock amber, Angka stat besar, Sub-text "kelas dalam progres".
    *   **Card 4 (Sertifikat):** Icon award green, Angka stat besar, Sub-text "sertifikat diperoleh".

## KOMPONEN 5: SECTION "LANJUTKAN BELAJAR"
*   **Card Horizontal Besar (Single):** Min-height 160px.
    *   **Kiri (Thumbnail Area):** Width fixed 220px, Aspect ratio 16:9, Overlay saat hover icon play-circle.
    *   **Kanan (Content Area):**
        *   Top: Category Badge "Hardware (IoT)", Course Title "IoT Fundamentals with ESP32", Status "Modul 2 - Instalasi Driver CH340".
        *   Bottom (Progress Area): Label "Progress Belajar" vs "42%". Progress Bar (Background #E2E8F0, Fill Volt Green gradient). CTA Button "Lanjutkan →" (Tech Blue).

## KOMPONEN 6: SECTION "EKSPLORASI MODUL LAINNYA"
*   **Grid Modul Card (3 Kolom):** Grid 3-column, gap 24px.
*   **Single Modul Card (Vertical):** Hover border Tech Blue, lift translateY -4px.
    *   1. **Thumbnail Area:** Aspect 16:9, Overlay Badge "BARU/REKOMENDASI" (Volt Green).
    *   2. **Content Area (Padding 20px):** Category Tag, Course Title (max 2 baris), Meta Info (modules + duration), Divider 1px, Price (Rp 199.000), CTA Icon (arrow-right Tech Blue).

## EMPTY STATES & VARIATIONS
*   **Jika User Belum Punya Kursus Aktif:** Tampilkan empty state illustration. H3 "Belum Ada Kursus Aktif". CTA "Jelajahi Katalog" (Volt Green button).
*   **Jika Belum Ada Sertifikat:** Value angka "0", Sub-text "Selesaikan kursus untuk dapatkan sertifikat".
*   **Status Paket Badge Variations:**
    *   Lifetime: Volt Green bg, dark text.
    *   Langganan Aktif: Tech Blue light bg, Tech Blue text.
    *   Trial: Amber bg, dark text.
    *   Expired: Red light bg, red text.