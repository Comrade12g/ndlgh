DROP TRIGGER IF EXISTS trg_package_autoinvoice ON public.packages;
CREATE TRIGGER trg_package_autoinvoice AFTER INSERT ON public.packages
  FOR EACH ROW
  WHEN (COALESCE(current_setting('ndl.skip_autoinvoice', true), '') <> 'on')
  EXECUTE FUNCTION public.fn_autoinvoice_package();

DROP TRIGGER IF EXISTS trg_package_reprice ON public.packages;
CREATE TRIGGER trg_package_reprice
  AFTER UPDATE OF weight_kg, cbm, description, warehouse_code, customer_id, rate_per_cbm, air_category
  ON public.packages
  FOR EACH ROW
  WHEN (COALESCE(current_setting('ndl.skip_autoinvoice', true), '') <> 'on')
  EXECUTE FUNCTION public.fn_reprice_package();

CREATE OR REPLACE FUNCTION public.import_arrival_manifest(_rows jsonb, _status public.package_status)
RETURNS TABLE(row_no integer, result text, package_id uuid, tracking_code text, customer_id uuid, full_name text, phone text, shipping_mark text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
  i integer := 0;
  v_mark text;
  v_ext text;
  v_pkg public.packages;
  v_prof public.profiles;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.is_staff(v_uid) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _status NOT IN ('in_transit','arrived_gh','ready_delivery') THEN
    RAISE EXCEPTION 'Unsupported status';
  END IF;

  PERFORM set_config('ndl.skip_autoinvoice', 'on', true);

  FOR r IN SELECT * FROM jsonb_array_elements(_rows) LOOP
    i := i + 1;
    v_mark := NULLIF(upper(trim(r->>'mark')), '');
    v_ext := NULLIF(trim(r->>'tracking'), '');
    v_pkg := NULL; v_prof := NULL;

    IF v_mark IS NOT NULL THEN
      SELECT * INTO v_prof FROM public.profiles p WHERE p.shipping_mark = v_mark LIMIT 1;
    END IF;

    IF v_ext IS NOT NULL THEN
      SELECT * INTO v_pkg FROM public.packages p
        WHERE p.external_tracking = v_ext OR p.tracking_code = v_ext
        ORDER BY p.created_at DESC LIMIT 1;
    END IF;

    IF v_pkg.id IS NOT NULL THEN
      UPDATE public.packages p SET
        status = _status,
        pieces = COALESCE(NULLIF((r->>'pieces'),'')::int, p.pieces),
        weight_kg = COALESCE(NULLIF((r->>'weight_kg'),'')::numeric, p.weight_kg),
        cbm = COALESCE(NULLIF((r->>'cbm'),'')::numeric, p.cbm),
        description = COALESCE(NULLIF(r->>'description',''), p.description),
        customer_id = COALESCE(p.customer_id, v_prof.id),
        shipping_mark = COALESCE(p.shipping_mark, v_mark)
      WHERE p.id = v_pkg.id
      RETURNING * INTO v_pkg;
      IF v_prof.id IS NULL AND v_pkg.customer_id IS NOT NULL THEN
        SELECT * INTO v_prof FROM public.profiles p WHERE p.id = v_pkg.customer_id;
      END IF;
      result := 'updated';
    ELSE
      INSERT INTO public.packages (customer_id, shipping_mark, external_tracking, description, pieces, weight_kg, cbm, status, received_at, received_by)
      VALUES (v_prof.id, v_mark, v_ext, NULLIF(r->>'description',''),
              COALESCE(NULLIF((r->>'pieces'),'')::int, 1),
              COALESCE(NULLIF((r->>'weight_kg'),'')::numeric, 0),
              COALESCE(NULLIF((r->>'cbm'),'')::numeric, 0),
              _status, now(), v_uid)
      RETURNING * INTO v_pkg;
      result := 'created';
    END IF;

    row_no := i;
    package_id := v_pkg.id; tracking_code := v_pkg.tracking_code;
    customer_id := v_prof.id; full_name := v_prof.full_name; phone := v_prof.phone;
    shipping_mark := COALESCE(v_mark, v_pkg.shipping_mark);
    RETURN NEXT;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.import_arrival_manifest(jsonb, public.package_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_arrival_manifest(jsonb, public.package_status) TO authenticated;