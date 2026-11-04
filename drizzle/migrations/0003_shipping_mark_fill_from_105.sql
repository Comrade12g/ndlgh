CREATE OR REPLACE FUNCTION public.generate_shipping_mark()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE n bigint; v text;
BEGIN
  LOOP
    n := nextval('public.shipping_mark_seq');
    v := 'ND' || LPAD(n::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE shipping_mark = v);
  END LOOP;
  RETURN v;
END $$;
REVOKE EXECUTE ON FUNCTION public.generate_shipping_mark() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_shipping_mark(_user_id uuid, _mark text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v text := upper(trim(_mark));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can change customer IDs'; END IF;
  IF v ~ '^ND[0-9]{1,4}$' THEN v := 'ND' || LPAD(substring(v from 3), 4, '0');
  ELSIF v ~ '^[0-9]{1,4}$' THEN v := 'ND' || LPAD(v, 4, '0');
  ELSE RAISE EXCEPTION 'Customer ID must look like ND0044'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE shipping_mark = v AND id <> _user_id) THEN
    RAISE EXCEPTION '% is already used by another customer', v; END IF;
  UPDATE public.profiles SET shipping_mark = v WHERE id = _user_id;
  UPDATE public.packages SET shipping_mark = v WHERE customer_id = _user_id;
  RETURN v;
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_set_shipping_mark(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_shipping_mark(uuid, text) TO authenticated;

SELECT setval('public.shipping_mark_seq', 104, true);