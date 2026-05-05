# KONEKSI.IO — FONDASI DESAIN DASHBOARD

## Palet Warna (Clean/Light Theme)
*   **Background Utama:** `#F8FAFC` (Slate Gray sangat muda) — area workspace dashboard
*   **Surface Kartu:** `#FFFFFF` (Putih bersih) — semua card components
*   **Tech Blue (#1164b8):** Sidebar menu aktif, link, tombol sekunder, border aksen
*   **Volt Green (#b1de01):** Progress bar, badge status aktif, CTA primer
*   **Warning/Amber:** `#FEF3C7` (background alert banner), `#F59E0B` (teks/icon warning)
*   **Neutral Palette:**
    *   Border: `#E2E8F0` (sangat tipis, barely visible)
    *   Text Primary: `#1E293B`
    *   Text Secondary: `#64748B`
    *   Disabled: `#CBD5E1`

## Tipografi
*   **Heading & Angka Statistik:** "Plus Jakarta Sans" (700/800 weight) — bold, modern, geometric
*   **Body Text & Menu:** "Inter" (400/500/600 weight) — sangat readable, netral
*   **Scale:**
    *   H1 (Page Title): 32px/40px, weight 700
    *   H2 (Section Title): 24px/32px, weight 700
    *   H3 (Card Title): 18px/24px, weight 600
    *   Stat Number: 36px/44px, weight 800
    *   Body: 15px/24px, weight 400
    *   Menu Item: 14px/20px, weight 500
    *   Caption/Meta: 13px/20px, weight 400

## Spacing System
Menggunakan 8px grid: 8, 12, 16, 24, 32, 48, 64px

## Shadow System (Sangat Halus)
*   **Card Default:** `0 1px 2px rgba(0, 0, 0, 0.04)`
*   **Card Hover:** `0 2px 8px rgba(17, 100, 184, 0.08)`
*   **Elevated:** `0 4px 12px rgba(0, 0, 0, 0.06)`

## DESIGN TOKENS (untuk Consistency)
```json
{
  "colors": {
    "primary": "#1164b8",
    "accent": "#b1de01",
    "background": "#F8FAFC",
    "surface": "#FFFFFF",
    "border": "#E2E8F0",
    "text": {
      "primary": "#1E293B",
      "secondary": "#64748B",
      "disabled": "#CBD5E1"
    },
    "status": {
      "warning": "#F59E0B",
      "success": "#10B981",
      "error": "#DC2626",
      "info": "#1164b8"
    }
  },
  "spacing": {
    "xs": "8px", "sm": "12px", "md": "16px",
    "lg": "24px", "xl": "32px", "2xl": "48px", "3xl": "64px"
  },
  "borderRadius": {
    "sm": "6px", "md": "8px", "lg": "12px", "full": "9999px"
  },
  "shadows": {
    "card": "0 1px 2px rgba(0, 0, 0, 0.04)",
    "cardHover": "0 2px 8px rgba(17, 100, 184, 0.08)",
    "elevated": "0 4px 12px rgba(0, 0, 0, 0.06)"
  }
}