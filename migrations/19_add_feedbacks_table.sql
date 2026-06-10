-- migrations/19_add_feedbacks_table.sql
-- Jalankan file SQL ini di Supabase SQL Editor untuk membuat tabel feedbacks
-- dan mengatur kebijakan Row Level Security (RLS).

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kritik', 'saran')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaktifkan RLS (Row Level Security)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Reset kebijakan yang lama (jika ada)
DROP POLICY IF EXISTS "Feedbacks SELECT policy" ON public.feedbacks;
DROP POLICY IF EXISTS "Feedbacks INSERT policy" ON public.feedbacks;

-- Pengguna hanya dapat melihat masukan miliknya sendiri, sedangkan admin dapat melihat semuanya
CREATE POLICY "Feedbacks SELECT policy" ON public.feedbacks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Pengguna hanya dapat memasukkan masukan mereka sendiri
CREATE POLICY "Feedbacks INSERT policy" ON public.feedbacks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
