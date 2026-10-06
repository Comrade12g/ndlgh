DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id, shipping_mark FROM public.profiles
           WHERE created_at >= '2026-08-27' AND shipping_mark ~ '^ND[0-9]{4}$'
           ORDER BY substring(shipping_mark from 3)::int DESC
  LOOP
    UPDATE public.profiles SET shipping_mark = 'ND' || LPAD((substring(r.shipping_mark from 3)::int + 5)::text, 4, '0') WHERE id = r.id;
  END LOOP;
END $$;

UPDATE public.packages p SET shipping_mark = pr.shipping_mark
FROM public.profiles pr WHERE p.customer_id = pr.id AND p.shipping_mark IS DISTINCT FROM pr.shipping_mark;

SELECT setval('public.shipping_mark_seq', GREATEST((SELECT max(substring(shipping_mark from 3)::int) FROM public.profiles WHERE shipping_mark ~ '^ND[0-9]{4}$'), 1));

CREATE OR REPLACE FUNCTION public.admin_set_shipping_mark(_user_id uuid, _mark text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v text := upper(trim(_mark)); n int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can change customer IDs'; END IF;
  IF v ~ '^ND[0-9]{1,4}$' THEN v := 'ND' || LPAD(substring(v from 3), 4, '0'); 
  ELSIF v ~ '^[0-9]{1,4}$' THEN v := 'ND' || LPAD(v, 4, '0');
  ELSE RAISE EXCEPTION 'Customer ID must look like ND0044'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE shipping_mark = v AND id <> _user_id) THEN
    RAISE EXCEPTION '% is already used by another customer', v; END IF;
  UPDATE public.profiles SET shipping_mark = v WHERE id = _user_id;
  UPDATE public.packages SET shipping_mark = v WHERE customer_id = _user_id;
  n := substring(v from 3)::int;
  IF n > (SELECT last_value FROM public.shipping_mark_seq) THEN PERFORM setval('public.shipping_mark_seq', n); END IF;
  RETURN v;
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_set_shipping_mark(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_shipping_mark(uuid, text) TO authenticated;