
-- 1) New enum for standard customer-facing milestones
CREATE TYPE public.shipment_milestone AS ENUM (
  'picked_up',
  'departed_origin',
  'in_transit',
  'arrived_tema',
  'customs_clearance',
  'out_for_delivery',
  'delivered'
);

-- 2) Sequence + generator for NDL-CN-XXXXX ocean reference
CREATE SEQUENCE IF NOT EXISTS public.ndl_cn_ref_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_ndl_cn_ref()
RETURNS text
LANGUAGE sql
SET search_path = public
AS $$
  SELECT 'NDL-CN-' || LPAD(nextval('public.ndl_cn_ref_seq')::text, 5, '0');
$$;

-- 3) Extend shipments for carrier tracking
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS booking_no text,
  ADD COLUMN IF NOT EXISTS port_of_loading text,
  ADD COLUMN IF NOT EXISTS port_of_discharge text,
  ADD COLUMN IF NOT EXISTS original_eta date,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS eta_last_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS current_milestone public.shipment_milestone NOT NULL DEFAULT 'picked_up',
  ADD COLUMN IF NOT EXISTS ndl_reference text UNIQUE;

-- Backfill refs for existing rows
UPDATE public.shipments SET ndl_reference = public.generate_ndl_cn_ref() WHERE ndl_reference IS NULL;

-- Trigger to auto-generate reference and initialize original_eta
CREATE OR REPLACE FUNCTION public.fn_shipment_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ndl_reference IS NULL THEN
    NEW.ndl_reference := public.generate_ndl_cn_ref();
  END IF;
  IF NEW.original_eta IS NULL AND NEW.eta IS NOT NULL THEN
    NEW.original_eta := NEW.eta;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shipment_defaults ON public.shipments;
CREATE TRIGGER trg_shipment_defaults
  BEFORE INSERT ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.fn_shipment_defaults();

-- Track ETA changes
CREATE OR REPLACE FUNCTION public.fn_shipment_track_eta_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.eta IS DISTINCT FROM OLD.eta THEN
    NEW.eta_last_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shipment_track_eta ON public.shipments;
CREATE TRIGGER trg_shipment_track_eta
  BEFORE UPDATE OF eta ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.fn_shipment_track_eta_change();

-- 4) Carrier code -> standard milestone mapping
CREATE TABLE IF NOT EXISTS public.shipment_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier text NOT NULL,
  carrier_status_code text NOT NULL,
  standard_milestone public.shipment_milestone NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (carrier, carrier_status_code)
);

GRANT SELECT ON public.shipment_milestones TO authenticated;
GRANT ALL ON public.shipment_milestones TO service_role;
ALTER TABLE public.shipment_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage milestone map" ON public.shipment_milestones
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Authenticated can read milestone map" ON public.shipment_milestones
  FOR SELECT TO authenticated USING (true);

-- Seed common carrier codes
INSERT INTO public.shipment_milestones (carrier, carrier_status_code, standard_milestone, description) VALUES
  ('PIL',    'GATE_IN',       'picked_up',         'Gate in at origin'),
  ('PIL',    'LOADED',        'departed_origin',   'Loaded on vessel'),
  ('PIL',    'DEPARTED',      'departed_origin',   'Vessel departed'),
  ('PIL',    'IN_TRANSIT',    'in_transit',        'On the water'),
  ('PIL',    'ARRIVED',       'arrived_tema',      'Arrived at Tema'),
  ('PIL',    'DISCHARGED',    'customs_clearance', 'Discharged, clearing customs'),
  ('PIL',    'DELIVERED',     'delivered',         'Delivered'),
  ('MSC',    'CARGO_RECEIVED','picked_up',         'Cargo received'),
  ('MSC',    'LOAD',          'departed_origin',   'Loaded'),
  ('MSC',    'DEPART',        'departed_origin',   'Departed'),
  ('MSC',    'TRANSIT',       'in_transit',        'In transit'),
  ('MSC',    'ARRIVAL',       'arrived_tema',      'Arrived'),
  ('MSC',    'DISCHARGE',     'customs_clearance', 'Discharged'),
  ('MSC',    'DELIVERED',     'delivered',         'Delivered'),
  ('Maersk', 'RCS',           'picked_up',         'Received at shipper'),
  ('Maersk', 'LOAD',          'departed_origin',   'Loaded on vessel'),
  ('Maersk', 'VDL',           'departed_origin',   'Vessel departed'),
  ('Maersk', 'TSD',           'in_transit',        'Transhipment / in transit'),
  ('Maersk', 'VAD',           'arrived_tema',      'Vessel arrived'),
  ('Maersk', 'DIS',           'customs_clearance', 'Discharged'),
  ('Maersk', 'DLV',           'delivered',         'Delivered')
ON CONFLICT DO NOTHING;

-- 5) Customer-safe RPC (never exposes carrier/container/booking)
CREATE OR REPLACE FUNCTION public.get_my_ocean_shipments()
RETURNS TABLE (
  ndl_reference text,
  origin_city text,
  destination_city text,
  current_milestone public.shipment_milestone,
  current_eta date,
  eta_last_changed_at timestamptz,
  eta_recently_changed boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.ndl_reference,
    COALESCE(s.port_of_loading, wo.name, s.origin_warehouse)          AS origin_city,
    COALESCE(s.port_of_discharge, wd.name, s.destination_warehouse, 'Tema, Ghana') AS destination_city,
    s.current_milestone,
    s.eta                                                              AS current_eta,
    s.eta_last_changed_at,
    (s.eta_last_changed_at IS NOT NULL AND s.eta_last_changed_at > now() - interval '7 days') AS eta_recently_changed
  FROM public.shipments s
  LEFT JOIN public.warehouses wo ON wo.code = s.origin_warehouse
  LEFT JOIN public.warehouses wd ON wd.code = s.destination_warehouse
  WHERE EXISTS (
    SELECT 1 FROM public.shipment_packages sp
    JOIN public.packages p ON p.id = sp.package_id
    WHERE sp.shipment_id = s.id AND p.customer_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.get_my_ocean_shipments() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_ocean_shipments() TO authenticated;
