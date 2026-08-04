CREATE TABLE public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  seo_title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'shipping-costs',
  image text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  read_minutes integer NOT NULL DEFAULT 5,
  intro jsonb NOT NULL DEFAULT '[]'::jsonb,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.guides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT ALL ON public.guides TO service_role;

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published guides are publicly readable"
  ON public.guides FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Staff can read all guides"
  ON public.guides FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert guides"
  ON public.guides FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update guides"
  ON public.guides FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete guides"
  ON public.guides FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER guides_set_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text NOT NULL,
  phone text,
  lead_type text NOT NULL DEFAULT 'newsletter',
  source_path text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(email) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(coalesce(full_name,'')) <= 120
    AND char_length(coalesce(phone,'')) <= 32
    AND char_length(coalesce(message,'')) <= 2000
    AND lead_type IN ('newsletter','consultation')
  );

CREATE POLICY "Staff can read leads"
  ON public.leads FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete leads"
  ON public.leads FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_guides_status_published ON public.guides (status, published_at DESC);
CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);