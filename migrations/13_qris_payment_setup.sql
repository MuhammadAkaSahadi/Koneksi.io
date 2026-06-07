-- Migration 13: QRIS Payment Setup
-- Add fields untuk QRIS static payment flow dengan manual verification

-- 1. Add unique_code field untuk track 3-digit verification code
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS unique_code INTEGER,
  ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES themes(id);

COMMENT ON COLUMN transactions.unique_code IS '3-digit unique code added to base price for QRIS verification';
COMMENT ON COLUMN transactions.theme_id IS 'Direct reference to theme for easier enrollment creation';

-- 2. Create index untuk faster lookup pending transactions dengan amount
CREATE INDEX IF NOT EXISTS idx_transactions_pending_amount
  ON transactions(status, total_amount, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_transactions_theme_id ON transactions(theme_id);

-- 3. Create storage bucket untuk transfer proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('transfer-proofs', 'transfer-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies

-- Users dapat upload transfer proof mereka sendiri
CREATE POLICY "Users can upload transfer proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transfer-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users dapat read transfer proof mereka sendiri
CREATE POLICY "Users can read own transfer proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transfer-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins dapat read semua transfer proofs
CREATE POLICY "Admins can read all transfer proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transfer-proofs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Admins dapat delete transfer proofs
CREATE POLICY "Admins can delete transfer proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'transfer-proofs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
