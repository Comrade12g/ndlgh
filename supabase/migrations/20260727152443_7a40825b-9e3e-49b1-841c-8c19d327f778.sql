-- Remove anon SELECT on rates (staff-only read; public quote uses server admin)
DROP POLICY IF EXISTS "Anyone can view active rates" ON public.rates;
DROP POLICY IF EXISTS "Public can view active rates" ON public.rates;
DROP POLICY IF EXISTS "rates_public_read" ON public.rates;
DROP POLICY IF EXISTS "rates_anon_read" ON public.rates;
REVOKE SELECT ON public.rates FROM anon;

-- Ensure staff can still read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='rates' AND policyname='Staff can view rates'
  ) THEN
    CREATE POLICY "Staff can view rates" ON public.rates
      FOR SELECT TO authenticated
      USING (public.is_staff(auth.uid()));
  END IF;
END $$;

-- Explicit deny for client-side inserts on invite_audit_log
DROP POLICY IF EXISTS "invite_audit_log_no_client_insert" ON public.invite_audit_log;
CREATE POLICY "invite_audit_log_no_client_insert" ON public.invite_audit_log
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);
