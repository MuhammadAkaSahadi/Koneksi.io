# INTERAKSI, AKSESIBILITAS & IMPLEMENTASI TEKNIS

## MICRO-INTERACTIONS & ANIMATIONS
1.  **CountUp Animation:** Trigger viewport enter, duration 1200ms.
2.  **Chart Line Drawing:** Path stroke-dasharray animation on mount (1500ms).
3.  **Table Row Hover:** Slight scale 1.005, background fade (150ms).
4.  **Status Badge Pulse:** Pending status memiliki pulse animation infinite pada icon (2s).
5.  **Search Input Focus:** Border transition, shadow expand (ring effect).
6.  **Notification Bell:** Continuous pulse + scale (1.5s infinite).
7.  **Filter Dropdown:** Height expand + sequential fade in (250ms).
8.  **Export Button:** Icon spin 360deg saat loading, success bounce effect.

## RESPONSIVE BEHAVIOR
*   **Desktop Large (>1440px):** Main content max-width 1400px centered, font size tabel 15px.
*   **Tablet Landscape (1024-1279px):** Sidebar collapse jadi icon-only (72px). Chart stack vertical (100% width).
*   **Tablet Portrait (768-1023px):** Sidebar jadi off-canvas drawer. Top header ada hamburger menu. Table scroll horizontal.
*   **Mobile (<768px):** TIDAK DIREKOMENDASIKAN. Muncul alert "Gunakan desktop untuk pengalaman terbaik".

## AKSESIBILITAS (a11y)
*   **Keyboard & Screen Reader:** Focus visible 2px outline. `aria-label` untuk grafik dan status badges. `aria-live` untuk search result dan notifikasi. Semantic HTML (`<nav>`, `<table>`).
*   **Data Table:** Sortable columns (`aria-sort`), row selection announcements.

## ADDITIONAL FEATURES
*   **Real-time Updates:** WebSocket connection, visual indicator row flash (green fade).
*   **Bulk Actions:** Checkbox column, fixed bottom action bar saat ada selection.
*   **Advanced Filters:** Filter panel collapsible (Date range, status, payment method).
*   **Chart Interactions:** Click-drag untuk zoom in time range, shift+drag untuk pan.

## CATATAN IMPLEMENTASI (Tech Stack Recommendation)
*   **Frontend:** React + TypeScript.
*   **Styling:** Tailwind CSS + CSS-in-JS.
*   **Charts:** Recharts (React-native) atau ApexCharts.
*   **Table:** TanStack Table (React Table v8) — Headless & powerful.
*   **Data Fetching:** React Query (caching & real-time sync) + Socket.io.
*   **Performance:** Virtual Scrolling untuk tabel besar (react-window), Lazy load chart, Debounce search 300ms.
*   **Security:** Role-based Access Control (RBAC), Masking data sensitif, Auto logout 30 menit inaktif.