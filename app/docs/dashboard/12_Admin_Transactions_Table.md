# KOMPONEN 5: RECENT TRANSACTIONS TABLE

## Table Container & Header
*   **Container:** Full Width, Background `#FFFFFF`, padding 0, overflow hidden.
*   **Header (Padding 24px 28px):**
    *   Kiri: "Transaksi Terbaru" (Diperbaharui real-time).
    *   Kanan (Filters/Actions): Dropdown "Semua Status ▾" + Button "Export" (outline Tech Blue).

## Table Structure
*   **Table Head:** Background `#F8FAFC`, text `#64748B`, 13px uppercase, letter-spacing 0.5px.
    *   Columns: ID Transaksi (10%), Nama Pengguna (18%), Email (20%), Modul/Paket (20%), Tanggal (12%), Total (12%, right), Status (8%, center).
*   **Table Body (TR & TD):**
    *   Row Hover: Background `#F8FAFC`.
    *   ID Transaksi: Monospace, copy to clipboard on click.
    *   Nama Pengguna: Flex horizontal (Avatar 32px + Nama).
    *   Total: "Rp 199.000" (Plus Jakarta Sans 15px, weight 700).

## Status Badge Component (Pill-shaped)
*   **Variant Success:** Background `#D1FAE5`, text `#065F46`, icon check-circle.
*   **Variant Pending:** Background `#FEF3C7`, text `#92400E`, icon clock.
*   **Variant Cancelled:** Background `#FEE2E2`, text `#991B1B`, icon x-circle.

## Table Footer & Empty State
*   **Footer:** Kiri text "Menampilkan 1-10...", Kanan Pagination buttons (Prev, numbers, Next). Active page bg Tech Blue.
*   **Empty State:** Center aligned, icon inbox 64px, "Belum Ada Transaksi".

## STATES & VARIATIONS
*   **Table Row States:** Selected (background `#EBF5FF`, border left 3px Tech Blue). Loading (Skeleton shimmer).
*   **Metric Card Trend:** Positive (+ hijau), Negative (- merah), Neutral (0% abu-abu).
*   **Chart Data Loading:** Empty state "Belum ada data", atau error alert dengan retry button.