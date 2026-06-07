-- Migration 15: Add unique_code to themes table
ALTER TABLE themes ADD COLUMN IF NOT EXISTS unique_code INTEGER DEFAULT 0;

COMMENT ON COLUMN themes.unique_code IS 'Unique code configured by admin for QRIS payment';
