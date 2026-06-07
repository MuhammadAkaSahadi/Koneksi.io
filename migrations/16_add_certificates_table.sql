-- migrations/16_add_certificates_table.sql
-- Run this SQL in the Supabase SQL Editor to create the certificates table and setup RLS policies.

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE NOT NULL,
  certificate_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, theme_id)
);

-- Enable Row Level Security
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view certificates (Public Verification)
CREATE POLICY "Certificates SELECT policy" ON public.certificates
  FOR SELECT
  USING (true);

-- 2. Authenticated users can insert their own certificate records
CREATE POLICY "Certificates INSERT policy" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Admins or users themselves can delete or update their certificates (if needed, though certificates are usually immutable)
CREATE POLICY "Certificates admin write policy" ON public.certificates
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
