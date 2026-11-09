CREATE TABLE public.guest_container_bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 code text NOT NULL UNIQUE DEFAULT ('NDL-FCL-' || lpad(nextval('public.fcl_booking_seq')::text, 5, '0')),
 full_name text NOT NULL,
 phone text NOT NULL,
 email text,
 container_size text NOT NULL CHECK (container_size IN ('20ft','40ft','40hq')),
 quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 50),
 origin_city text NOT NULL,
 commodity text NOT NULL,
 cargo_ready_date date,
 delivery_city text,
 notes text,
 status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','loading','in_transit','arrived','clearing','delivered','cancelled')),
 container_no text,
 shipment_id uuid REFERENCES public.shipments(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_container_bookings TO authenticated;
GRANT ALL ON public.guest_container_bookings TO service_role;
ALTER TABLE public.guest_container_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage guest container bookings" ON public.guest_container_bookings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER guest_container_bookings_updated_at BEFORE UPDATE ON public.guest_container_bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();