CREATE SEQUENCE IF NOT EXISTS public.fcl_booking_seq START 1;

CREATE TABLE public.container_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('NDL-FCL-' || lpad(nextval('public.fcl_booking_seq')::text, 5, '0')),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  container_size text NOT NULL CHECK (container_size IN ('20ft','40ft','40hq')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 50),
  origin_city text NOT NULL,
  commodity text NOT NULL,
  cargo_ready_date date,
  delivery_city text,
  notes text,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','loading','in_transit','arrived','clearing','delivered','cancelled')),
  container_no text,
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  staff_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.container_bookings TO authenticated;
GRANT ALL ON public.container_bookings TO service_role;
GRANT USAGE ON SEQUENCE public.fcl_booking_seq TO authenticated, service_role;

ALTER TABLE public.container_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own bookings" ON public.container_bookings
  FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers create own bookings" ON public.container_bookings
  FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid() AND status = 'requested' AND shipment_id IS NULL AND container_no IS NULL AND staff_notes IS NULL);
CREATE POLICY "Staff manage bookings" ON public.container_bookings
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER trg_container_bookings_updated BEFORE UPDATE ON public.container_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_my_container_booking(_code text)
RETURNS TABLE(code text, container_size text, quantity integer, origin_city text, commodity text,
  cargo_ready_date date, delivery_city text, notes text, status text, container_no text, created_at timestamptz,
  vessel_or_flight text, carrier text, etd date, eta date, actual_departure date, actual_arrival date,
  current_milestone shipment_milestone, bol_no text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.code, b.container_size, b.quantity, b.origin_city, b.commodity, b.cargo_ready_date, b.delivery_city,
    b.notes, b.status, COALESCE(b.container_no, s.container_no), b.created_at,
    s.vessel_or_flight, s.carrier, s.etd, s.eta, s.actual_departure, s.actual_arrival, s.current_milestone, s.bol_no
  FROM public.container_bookings b
  LEFT JOIN public.shipments s ON s.id = b.shipment_id
  WHERE upper(b.code) = upper(_code)
    AND (b.customer_id = auth.uid() OR public.is_staff(auth.uid()));
$$;
REVOKE ALL ON FUNCTION public.get_my_container_booking(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_my_container_booking(text) TO authenticated;