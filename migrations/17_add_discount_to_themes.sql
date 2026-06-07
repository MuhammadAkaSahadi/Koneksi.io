-- Migration 17: Add discount column to themes table
ALTER TABLE themes ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;

COMMENT ON COLUMN themes.discount IS 'Discount amount for lifetime price of the theme/course (optional)';
