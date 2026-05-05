# KONEKSI.IO — FONDASI DESAIN ADMIN PANEL

## Palet Warna (Konsisten dengan User Dashboard)
*   **Background Workspace:** `#F8FAFC` (Slate Gray sangat muda)
*   **Surface (Cards/Tables):** `#FFFFFF` (Putih bersih)
*   **Tech Blue (#1164b8):** Menu aktif, primary buttons, chart primary line
*   **Volt Green (#b1de01):** Badge sukses, trend positif, growth indicators
*   **Warna Semantik Status:**
    *   Success: `#10B981` (Emerald Green)
    *   Pending/Warning: `#F59E0B` (Amber)
    *   Error/Cancelled: `#EF4444` (Red)
    *   Info: `#3B82F6` (Blue)
*   **Neutral Palette:**
    *   Border: `#E2E8F0`
    *   Text Primary: `#1E293B`
    *   Text Secondary: `#64748B`
    *   Text Tertiary: `#94A3B8`
    *   Disabled: `#CBD5E1`

## Tipografi
*   **Metrics & Headers:** "Plus Jakarta Sans" (700/800 weight) — bold, commanding
*   **Data & Body:** "Inter" (400/500/600 weight) — highly readable untuk tabel
*   **Scale:**
    *   Page Title (H1): 32px/40px, weight 700
    *   Section Title (H2): 24px/32px, weight 700
    *   Card Title (H3): 18px/24px, weight 600
    *   Metric Number: 40px/48px, weight 800
    *   Table Header: 13px/20px, weight 600, uppercase, letter-spacing 0.5px
    *   Table Data: 14px/20px, weight 400
    *   Body: 15px/24px, weight 400
    *   Caption: 13px/20px, weight 400

## Spacing & Shadow System
*   **Spacing:** 8px grid base (8, 12, 16, 20, 24, 32, 48, 64px)
*   **Shadows:**
    *   Card: `0 1px 3px rgba(0, 0, 0, 0.05)`
    *   Card Hover: `0 4px 12px rgba(0, 0, 0, 0.08)`
    *   Header: `0 1px 4px rgba(0, 0, 0, 0.06)`
    *   Dropdown: `0 8px 24px rgba(0, 0, 0, 0.12)`

## DESIGN TOKENS (Admin Panel)
```json
{
  "colors": {
    "sidebar": {
      "bg": "#1E293B",
      "text": "rgba(255, 255, 255, 0.7)",
      "textHover": "#FFFFFF",
      "menuActive": "#1164b8",
      "border": "rgba(255, 255, 255, 0.1)"
    },
    "content": {
      "bg": "#F8FAFC",
      "surface": "#FFFFFF",
      "border": "#E2E8F0"
    },
    "primary": "#1164b8",
    "accent": "#b1de01",
    "status": {
      "success": { "bg": "#D1FAE5", "text": "#065F46", "icon": "#10B981" },
      "pending": { "bg": "#FEF3C7", "text": "#92400E", "icon": "#F59E0B" },
      "error": { "bg": "#FEE2E2", "text": "#991B1B", "icon": "#EF4444" }
    }
  },
  "spacing": {
    "sidebar": "260px", "header": "64px", "contentPadding": "32px",
    "cardPadding": "24px", "tablePadding": "28px"
  }
}