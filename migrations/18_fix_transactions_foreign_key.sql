-- migrations/18_fix_transactions_foreign_key.sql
-- Run this SQL in the Supabase SQL Editor to update the foreign key constraint on the transactions table.
-- This allows deleting themes (curriculums) without violating foreign key constraints,
-- while preserving transaction history (setting the field to NULL).

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_theme_id_fkey,
  ADD CONSTRAINT transactions_theme_id_fkey
    FOREIGN KEY (theme_id)
    REFERENCES public.themes(id)
    ON DELETE SET NULL;
