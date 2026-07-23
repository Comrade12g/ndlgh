CREATE OR REPLACE FUNCTION public.price_package_line(_pkg packages)
 RETURNS TABLE(unit_price numeric, amount numeric, unit text, qty numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  r_kg   numeric;
  r_cbm  numeric;
  amt_kg numeric := 0;
  amt_cbm numeric := 0;
BEGIN
  SELECT r.price INTO r_kg
    FROM public.rates r
   WHERE r.active = true
     AND r.unit = 'KG'
     AND (r.origin_code = _pkg.warehouse_code OR r.origin_code IS NULL)
   ORDER BY (r.origin_code = _pkg.warehouse_code) DESC, r.effective_from DESC
   LIMIT 1;

  SELECT r.price INTO r_cbm
    FROM public.rates r
   WHERE r.active = true
     AND r.unit = 'CBM'
     AND (r.origin_code = _pkg.warehouse_code OR r.origin_code IS NULL)
   ORDER BY (r.origin_code = _pkg.warehouse_code) DESC, r.effective_from DESC
   LIMIT 1;

  amt_kg  := COALESCE(r_kg,0)  * COALESCE(_pkg.weight_kg,0);
  amt_cbm := COALESCE(r_cbm,0) * COALESCE(_pkg.cbm,0);

  IF amt_cbm > amt_kg THEN
    RETURN QUERY SELECT COALESCE(r_cbm,0)::numeric, amt_cbm::numeric, 'CBM'::text, COALESCE(_pkg.cbm,0)::numeric;
  ELSE
    RETURN QUERY SELECT COALESCE(r_kg,0)::numeric,  amt_kg::numeric,  'KG'::text,  COALESCE(_pkg.weight_kg,0)::numeric;
  END IF;
END;
$function$;