-- migrations/08_rls_policies.sql
-- Jalankan file SQL ini di Supabase SQL Editor untuk memperbaiki kebijakan RLS (Row Level Security) 
-- pada seluruh tabel database Koneksi.io.

-- =========================================================================
-- 1. FUNGSI PEMBANTU (HELPER FUNCTION)
-- =========================================================================
-- Fungsi ini mengecek apakah user saat ini adalah admin.
-- Menggunakan SECURITY DEFINER untuk mem-bypass RLS guna mencegah recursion error.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- 2. RESET POLICIES YANG LAMA (JIKA ADA)
-- =========================================================================
DROP POLICY IF EXISTS "Admin full access" ON public.themes;
DROP POLICY IF EXISTS "View own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Profiles SELECT policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles UPDATE policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin INSERT policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin DELETE policy" ON public.profiles;
DROP POLICY IF EXISTS "Themes SELECT policy" ON public.themes;
DROP POLICY IF EXISTS "Themes admin write policy" ON public.themes;
DROP POLICY IF EXISTS "Chapters SELECT policy" ON public.chapters;
DROP POLICY IF EXISTS "Chapters admin write policy" ON public.chapters;
DROP POLICY IF EXISTS "Lessons SELECT policy" ON public.lessons;
DROP POLICY IF EXISTS "Lessons admin write policy" ON public.lessons;
DROP POLICY IF EXISTS "Enrollments SELECT policy" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments admin write policy" ON public.enrollments;
DROP POLICY IF EXISTS "Subscriptions SELECT policy" ON public.subscriptions;
DROP POLICY IF EXISTS "Subscriptions admin write policy" ON public.subscriptions;
DROP POLICY IF EXISTS "Transactions SELECT policy" ON public.transactions;
DROP POLICY IF EXISTS "Transactions INSERT policy" ON public.transactions;
DROP POLICY IF EXISTS "Transactions UPDATE policy" ON public.transactions;
DROP POLICY IF EXISTS "Transactions admin DELETE policy" ON public.transactions;
DROP POLICY IF EXISTS "User progress SELECT policy" ON public.user_progress;
DROP POLICY IF EXISTS "User progress INSERT policy" ON public.user_progress;
DROP POLICY IF EXISTS "User progress UPDATE policy" ON public.user_progress;
DROP POLICY IF EXISTS "User progress DELETE policy" ON public.user_progress;

-- =========================================================================
-- 3. KEBIJAKAN (POLICIES) TABEL PROFILES
-- =========================================================================
CREATE POLICY "Profiles SELECT policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles UPDATE policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles admin INSERT policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Profiles admin DELETE policy" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 4. KEBIJAKAN (POLICIES) TABEL THEMES (Katalog Modul)
-- =========================================================================
CREATE POLICY "Themes SELECT policy" ON public.themes
  FOR SELECT
  USING (status = 'Published' OR public.is_admin());

CREATE POLICY "Themes admin write policy" ON public.themes
  FOR ALL TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 5. KEBIJAKAN (POLICIES) TABEL CHAPTERS (Bab Modul)
-- =========================================================================
CREATE POLICY "Chapters SELECT policy" ON public.chapters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.themes 
      WHERE id = chapters.theme_id AND (status = 'Published' OR public.is_admin())
    )
  );

CREATE POLICY "Chapters admin write policy" ON public.chapters
  FOR ALL TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 6. KEBIJAKAN (POLICIES) TABEL LESSONS (Materi Video)
-- =========================================================================
CREATE POLICY "Lessons SELECT policy" ON public.lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chapters c
      JOIN public.themes t ON t.id = c.theme_id
      WHERE c.id = lessons.chapter_id AND (t.status = 'Published' OR public.is_admin())
    )
  );

CREATE POLICY "Lessons admin write policy" ON public.lessons
  FOR ALL TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 7. KEBIJAKAN (POLICIES) TABEL ENROLLMENTS (Akses Tema Lifetime)
-- =========================================================================
CREATE POLICY "Enrollments SELECT policy" ON public.enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Enrollments admin write policy" ON public.enrollments
  FOR ALL TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 8. KEBIJAKAN (POLICIES) TABEL SUBSCRIPTIONS (Akses Langganan Aktif)
-- =========================================================================
CREATE POLICY "Subscriptions SELECT policy" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Subscriptions admin write policy" ON public.subscriptions
  FOR ALL TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 9. KEBIJAKAN (POLICIES) TABEL TRANSACTIONS (Riwayat Pembayaran)
-- =========================================================================
CREATE POLICY "Transactions SELECT policy" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Transactions INSERT policy" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Transactions UPDATE policy" ON public.transactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Transactions admin DELETE policy" ON public.transactions
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =========================================================================
-- 10. KEBIJAKAN (POLICIES) TABEL USER_PROGRESS (Progres Penyelesaian Materi)
-- =========================================================================
CREATE POLICY "User progress SELECT policy" ON public.user_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "User progress INSERT policy" ON public.user_progress
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "User progress UPDATE policy" ON public.user_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "User progress DELETE policy" ON public.user_progress
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
