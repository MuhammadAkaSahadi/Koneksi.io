# STRUKTUR LAYOUT DESKTOP (>1280px Optimal)

## Grid Utama
┌────────────┬──────────────────────────────────────┐
│            │  Top Header (Fixed, Height 64px)     │
│  Sidebar   ├──────────────────────────────────────┤
│  (Fixed    │                                      │
│  260px)    │    Main Content Area                 │
│            │    (Scrollable, Padding 32px)        │
└────────────┴──────────────────────────────────────┘
*   **Sidebar:** Fixed 260px width, full height (100vh), z-index 40
*   **Top Header:** Fixed top, calc(100% - 260px) width, offset-left 260px, z-index 30
*   **Main Content:** Margin-left 260px, margin-top 64px, padding 32px, min-height calc(100vh - 64px)

## KOMPONEN 1: LEFT SIDEBAR (Fixed Admin Navigation)
*   **Dimensi & Style:** Width 260px, Background `#1E293B` (Dark slate), Shadow `2px 0 8px rgba(0, 0, 0, 0.1)`.
*   **1. Logo Area:** Height 72px, Logo "Koneksi.io" (white) + Badge "Admin" (Volt Green bg). Border bottom 1px white opacity 10%.
*   **2. Navigation Menu:** Stack vertical, gap 6px.
    *   Items: Overview (AKTIF), Kelola Modul, Manajemen Pengguna, Data Transaksi, Pengaturan Web.
    *   Default: Transparent, text white opacity 70%.
    *   Hover: Background white opacity 8%, text white.
    *   AKTIF (Overview): Background Tech Blue solid, border-left 3px Volt Green.
*   **3. Admin Profile Section (Bottom):** Profile Card (Avatar gradient, Nama "Admin Utama", Role "Super Admin", dropdown icon).
*   **4. Logout Button:** Margin top 16px, background red tint (`rgba(239, 68, 68, 0.15)`), text light red.

## KOMPONEN 2: TOP HEADER (Fixed Bar)
*   **Dimensi & Style:** Height 64px, Background `#FFFFFF`, Border Bottom 1px `#E2E8F0`, padding 0 32px.
*   **Section 1: Breadcrumb (Kiri):** Icon home / Admin / **Overview** (bold).
*   **Section 2: Global Search Bar (Tengah):** Max-width 480px, background `#F8FAFC`, icon search absolut kiri. Focus state border Tech Blue. Dropdown *on typing* (Pengguna, Transaksi, Modul).
*   **Section 3: Action Icons (Kanan):** Notification Bell (dengan red dot indicator pulse), Admin Avatar circle.