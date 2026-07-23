-- 1) customer_notifications table
CREATE TABLE IF NOT EXISTS public.customer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  delivery_id uuid REFERENCES public.deliveries(id) ON DELETE SET NULL,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notifications TO authenticated;
GRANT ALL ON public.customer_notifications TO service_role;

ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage notifications"
  ON public.customer_notifications FOR ALL
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Customers view own notifications"
  ON public.customer_notifications FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE TRIGGER trg_customer_notifications_updated
  BEFORE UPDATE ON public.customer_notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_customer_notifications_customer ON public.customer_notifications(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notifications_status ON public.customer_notifications(status, created_at DESC);

-- 2) Backfill missing invoices for packages that were intaken before the trigger existed
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.id
    FROM public.packages p
    WHERE p.customer_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.invoice_items ii WHERE ii.package_id = p.id
      )
  LOOP
    PERFORM public.fn_autoinvoice_package_manual(r.id);
  END LOOP;
END $$;
