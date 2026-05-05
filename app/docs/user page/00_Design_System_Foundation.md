# KONEKSI.IO — FONDASI DESAIN & SISTEM UI

## FONDASI DESAIN
### Palet Warna
*   **Tech Blue (#1164b8):** Header, navigasi, tombol primer, border struktural
*   **Volt Green (#b1de01):** Badge freemium, status aktif, CTA sekunder, aksen hover
*   **Neutral Palette:**
    *   Background: #FFFFFF (putih bersih)
    *   Surface: #F8F9FA (slate gray sangat muda)
    *   Border: #E5E7EB
    *   Text Primary: #1F2937
    *   Text Secondary: #6B7280

### Tipografi
*   **Pasangan Font Rekomendasi:**
    *   Heading: "Plus Jakarta Sans" atau "Space Grotesk" — geometric modern dengan karakter teknologi
    *   Body: "Inter" atau "DM Sans" — sangat readable untuk konten teknis dan kode
*   **Scale:**
    *   H1: 48px/56px (desktop), 32px/40px (mobile)
    *   H2: 36px/44px (desktop), 24px/32px (mobile)
    *   H3: 24px/32px
    *   Body: 16px/24px
    *   Caption: 14px/20px

### Spacing System
Menggunakan sistem 8px grid: 8, 16, 24, 32, 48, 64, 96px

## KOMPONEN UI REUSABLE
### Button Variants
*   **Primary** (Volt Green bg, dark text, rounded-lg, hover glow)
*   **Secondary** (Tech Blue bg, white text, rounded-lg)
*   **Outline** (border Tech Blue, transparent bg, Tech Blue text)
*   **Ghost** (no border, hover background light)

### Badge Styles
*   **Freemium:** Volt Green bg, dark text, rounded-full, bold, uppercase 10px
*   **Category:** Tech Blue 10% bg, Tech Blue text, rounded-md
*   **Status:** Orange/Green/Gray depending on state

### Card Shadows
*   **Default:** 0 1px 3px rgba(0,0,0,0.1)
*   **Hover:** 0 4px 12px rgba(17, 100, 184, 0.15)
*   **Elevated:** 0 8px 24px rgba(0,0,0,0.12)

### Input Fields
*   Height: 48px
*   Border: 1px #E5E7EB
*   Border radius: 8px
*   Focus: Border Tech Blue 2px, outline none
*   Error: Border red, helper text red below

## MICRO-INTERACTIONS
*   **Card Hover:** Scale 1.02, shadow enhance, border color change (200ms ease)
*   **Button Hover:** Brightness 110%, glow effect dengan box-shadow Volt Green (150ms)
*   **CTA Pulse:** Subtle animation pada main CTA untuk menarik perhatian
*   **Loading State:** Skeleton screens dengan shimmer effect (gradient animation)
*   **Toast Notifications:** Slide dari top-right, auto-dismiss 3s, close button
*   **Modal:** Fade in backdrop, scale in content (300ms ease-out)
*   **Accordion:** Smooth height transition (250ms), rotate icon 180deg
*   **Progress Bar:** Smooth width transition dengan Volt Green fill

## AKSESIBILITAS
### Kontras Warna
*   Tech Blue (#1164b8) pada white: 4.8:1 ✓ (AA)
*   Volt Green (#b1de01) dengan dark text (#1F2937): 9.2:1 ✓ (AAA)
*   Semua teks body minimal 4.5:1

### Navigasi Keyboard
*   Focus visible: outline Tech Blue 2px offset 2px
*   Tab order logis
*   Skip to content link
*   Aria labels pada icon-only buttons

### Screen Reader
*   Semantic HTML (nav, main, article, aside)
*   Alt text pada gambar
*   Aria-label pada interactive elements
*   Live regions untuk dynamic content (toast, modal)

### Responsive Text
*   Min 16px untuk body text
*   Line-height 1.5 untuk keterbacaan
*   Max-width 65-75 karakter per baris untuk paragraf panjang

## CATATAN IMPLEMENTASI
*   Gunakan CSS Grid untuk layout utama, Flexbox untuk komponen
*   Implementasi lazy loading untuk images dan video thumbnails
*   Optimasi untuk Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)
*   Skeleton loading state untuk async content
*   Infinite scroll atau pagination dengan indicator jelas untuk katalog
*   Local storage untuk menyimpan pilihan filter dan progress
*   Session management untuk video player (resume dari terakhir)