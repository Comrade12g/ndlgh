CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  email text CHECK (email IS NULL OR char_length(email) <= 255),
  service_needed text NOT NULL CHECK (service_needed IN ('supplier_payment','procurement','training','shipping_payment')),
  what_to_buy_or_pay_for text CHECK (what_to_buy_or_pay_for IS NULL OR char_length(what_to_buy_or_pay_for) <= 1000),
  approximate_amount_or_budget text CHECK (approximate_amount_or_budget IS NULL OR char_length(approximate_amount_or_budget) <= 100),
  supplier_location text CHECK (supplier_location IS NULL OR supplier_location IN ('guangzhou','yiwu','other')),
  preferred_contact_time text CHECK (preferred_contact_time IS NULL OR char_length(preferred_contact_time) <= 100),
  experience_level text CHECK (experience_level IS NULL OR experience_level IN ('beginner','some','experienced')),
  message text CHECK (message IS NULL OR char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'new',
  consent_to_contact boolean NOT NULL CHECK (consent_to_contact = true)
);
GRANT SELECT, UPDATE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view service requests" ON public.service_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update service requests" ON public.service_requests
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));