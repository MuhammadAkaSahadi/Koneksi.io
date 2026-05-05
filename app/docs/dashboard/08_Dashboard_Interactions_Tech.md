# INTERAKSI, AKSESIBILITAS & TEKNIS DASHBOARD

## MICRO-INTERACTIONS
1.  **Card Hover Effects:** Duration 200ms ease-out. Border fade Tech Blue, shadow expand, subtle lift.
2.  **Progress Bar Fill:** Animasi width dari 0% ke aktual dalam 800ms. Shimmer effect overlay.
3.  **Menu Item Active State:** On click background fade Tech Blue (150ms), text fade white, scale pulse (1.02 to 1.0).
4.  **Stat Number Count-Up:** On viewport enter, angka count dari 0 ke nilai akhir dalam 1000ms.
5.  **CTA Button:** Hover brightness +10%, box-shadow glow muncul.
6.  **Thumbnail Video Overlay:** On hover backdrop fade in (300ms), play icon scale bounce effect.
7.  **Toast Notification:** Slide dari top-right, auto dismiss 3s.

## AKSESIBILITAS (a11y)
*   **Keyboard Navigation:** Tab order logis, Focus visible 2px outline Tech Blue, Skip to content link.
*   **Screen Reader:** Aria-label pada icon-only, Aria-live region untuk progress bar updates, Semantic HTML (`<nav>`, `<main>`, `<article>`).
*   **Kontras Warna:**
    *   Tech Blue (#1164b8) pada white: 4.8:1 ✓ AA
    *   Volt Green (#b1de01) dengan dark text: 9.2:1 ✓ AAA
*   **Touch Targets (Mobile):** Minimum 44x44px. Spacing minimal 8px.

## PERFORMANCE CONSIDERATIONS
*   **Image Optimization:** Lazy loading untuk thumbnail eksplorasi, format WebP, Blur placeholder (LQIP).
*   **Animation Performance:** Gunakan `transform` dan `opacity` (GPU-accelerated), hindari animasi `width/height`.
*   **Data Loading Strategy:** Stats widget fetch paralel. "Lanjutkan Belajar" server-side prioritas. Skeleton screens untuk perceived performance.

## CATATAN IMPLEMENTASI TEKNIS
*   **State Management:** Active menu tracking, progress sync real-time, user session state.
*   **CSS Architecture:** Utility-first (Tailwind CSS), Custom components untuk Card/Button.
*   **Component Hierarchy (React Example):**
```jsx
<DashboardLayout>
  <TopAlertBanner/>
  <Sidebar/>
  <MainContent>
    <DashboardHeader/>
    <StatsWidgetGrid>
      <StatCard/> x4
    </StatsWidgetGrid>
    <ContinueLearningSection>
      <CourseProgressCard/>
    </ContinueLearningSection>
    <ExploreModulesSection>
      <ModuleCardGrid>
        <ModuleCard/> x3
      </ModuleCardGrid>
    </ExploreModulesSection>
  </MainContent>
</DashboardLayout>