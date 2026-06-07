-- Migration 14: Auto-Enrollment Trigger
-- Automatically create enrollment when transaction status becomes success

-- Function untuk auto-create enrollment saat transaction SUCCESS
CREATE OR REPLACE FUNCTION public.handle_successful_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Check jika status berubah dari non-success ke success
  IF OLD.status IS DISTINCT FROM 'success' AND NEW.status = 'success' THEN

    -- Insert enrollment jika theme_id ada dan belum enrolled
    IF NEW.theme_id IS NOT NULL THEN
      INSERT INTO enrollments (user_id, theme_id, enrolled_at)
      VALUES (NEW.user_id, NEW.theme_id, NOW())
      ON CONFLICT (user_id, theme_id) DO NOTHING;

      RAISE NOTICE 'Auto-enrollment created for user % on theme %', NEW.user_id, NEW.theme_id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on transactions table
DROP TRIGGER IF EXISTS on_transaction_success ON transactions;
CREATE TRIGGER on_transaction_success
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'success')
  EXECUTE FUNCTION public.handle_successful_transaction();

COMMENT ON FUNCTION public.handle_successful_transaction() IS 'Auto-create enrollment when transaction status changes to success';
