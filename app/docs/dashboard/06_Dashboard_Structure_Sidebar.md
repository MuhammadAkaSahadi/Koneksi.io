# STRUKTUR LAYOUT DESKTOP (>1024px)

## Grid Utama
┌──────────────────────────────────────────────────┐
│  Top Banner Alert (Full Width, Dismissible)      │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  Sidebar   │    Main Content Area                │
│  (Fixed    │    (Scrollable)                     │
│   240px)   │                                     │
│            │                                     │
└────────────┴─────────────────────────────────────┘
*   **Layout Container:**
    *   Sidebar: Fixed width 240px, full height (100vh), tidak scroll dengan konten
    *   Main Content: Calc(100% - 240px), padding 32px, max-width 1280px

## KOMPONEN 1: TOP BANNER ALERT
*   **Desktop Layout:**
    *   Position: Fixed top (z-index 100), full-width, height auto (min 56px)
    *   Background: Linear gradient dari #FEF3C7 ke #FDE68A (subtle, left to right)
    *   Border Bottom: 1px solid #F59E0B opacity 20%
    *   Padding: 12px 32px 12px 272px (offset untuk sidebar 240px + spacing)
*   **Content Layout (Flexbox Horizontal):**
    *   **Icon Warning (kiri):** Size 20px, warna #F59E0B, Icon: alert-circle
    *   **Text Content (tengah, flex-grow):** Text: "Segera update nama lengkap kamu untuk sertifikat", Font: Inter 14px, weight 500, color #92400E
    *   **Action Buttons (kanan):** Button "Update Profile" (Small size, background #F59E0B, text white), Dismiss Button (X icon, 32px square)

## KOMPONEN 2: LEFT SIDEBAR (Fixed Desktop)
*   **Dimensi & Style:** Width 240px fixed, Height 100vh, Background #FFFFFF, Border Right 1px solid #E2E8F0.
*   **Struktur Konten (Flexbox Vertical):**
    1.  **Logo Area (Top):** Height 64px, Logo "Koneksi.io" (Plus Jakarta Sans, 20px, Tech Blue).
    2.  **Navigation Menu Area (Flex-grow):**
        *   Menu Items: Dashboard (AKTIF), Modul Saya, Sertifikat, Transaksi, Pengaturan, Komunitas (badge "Discord").
        *   Menu Item Default: Padding 12px 16px, Rounded 8px, Text #64748B.
        *   Menu Item AKTIF (Dashboard): Background #1164b8 (Tech Blue solid), Text #FFFFFF, Slight shadow.
        *   Badge Khusus: Position absolute kanan, Background Volt Green, uppercase 10px.
    3.  **Bottom Actions Area:**
        *   Margin Top: auto (pushed ke bawah)
        *   Button "Bantuan": Outline Tech Blue, Icon help-circle.
        *   Divider: 1px background #E2E8F0.
        *   Button "Logout": Transparent, hover red.

## RESPONSIVE BEHAVIOR
*   **Mobile (<768px): Sidebar Transformation**
    *   *Option A (Hamburger):* Sidebar collapse menjadi drawer off-canvas. Top bar muncul (height 56px) dengan hamburger icon.
    *   *Option B (Bottom Nav):* Sidebar hilang. Bottom Tab Bar (64px) dengan 5 tabs. Active color Tech Blue. Top Bar minimal untuk logo dan notifikasi.
*   **Tablet (768-1023px):** Sidebar tetap fixed (bisa lebih sempit 200px) atau collapse dengan icon-only mode (expand on hover).