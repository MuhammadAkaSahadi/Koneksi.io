# KOMPONEN UTAMA ADMIN DASHBOARD

## KOMPONEN 3: TOP METRICS WIDGET (Grid 4 Kolom)
*   **Layout:** Grid 4-column, gap 24px. Min-height 140px per card.
*   **Card Style:** Background `#FFFFFF`, border `#E2E8F0`, padding 24px, hover border Tech Blue opacity 30% + transform translateY -2px.
*   **Card Variants:**
    1.  **Pendapatan Bulan Ini:** Icon dollar-sign (Volt Green gradient bg). Metric: "Rp 12.450.000". Trend: "+15.3%" (hijau). Sub-info: "Dari 156 transaksi".
    2.  **Total Pengguna:** Icon users (Tech Blue bg opacity 10%). Metric: "1.234". Trend: "+42" (hijau). Sub-info: "Pengguna baru minggu ini".
    3.  **Langganan Aktif:** Icon refresh-cw (Purple bg opacity 10%). Metric: "487". Trend: "+8.2%" (hijau).
    4.  **Transaksi Pending:** Icon clock (Amber bg opacity 10%). Metric: "23". Badge: "Perlu Review".

## KOMPONEN 4: CHART SECTION (Layout 2 Kolom Asimetris)
*   **Layout:** Grid 2-column. Column Ratio: 65% (kiri) | 35% (kanan).

### KIRI: Revenue & Registration Chart Card (65% Width)
*   **Header:** "Grafik Pendapatan & Registrasi" vs Time Range Filter (7 Hari, 30 Hari (aktif), 90 Hari, 1 Tahun).
*   **Chart Config:** Line Chart dual Y-axis.
    *   **Line 1 (Pendapatan):** Tech Blue, smooth curve, area fill gradient Tech Blue.
    *   **Line 2 (Registrasi):** Volt Green, dashed [5,5], smooth curve.
    *   **Tooltip:** Dark slate bg, Date, Pendapatan amount, Icon + new users.

### KANAN: Top Modules Card (35% Width)
*   **Header:** "Modul Terlaris" (Bulan ini).
*   **List Item (3-5 items):** Background light gray wash, border `#E2E8F0`. Hover transform translateX 4px, border Tech Blue.
    *   Top Row: Rank Badge (#1 Gold, #2 Silver, #3 Bronze) vs Sales Count ("87 terjual").
    *   Title: "IoT Fundamentals with ESP32" (max 2 lines).
    *   Meta Row: Category badge, Revenue text (Volt Green). Progress bar relative to top performer.