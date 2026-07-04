-- The auto-invoicing engine (fn_autoinvoice_package -> price_package_line)
-- picks the higher of KG-based or CBM-based pricing per package, but never
-- applied a minimum billable quantity. This updates it to respect
-- rates.min_qty (e.g. "1 CBM minimum"), consistent with standard freight
-- forwarding practice and with what was requested for the Rates page.

CREATE OR REPLACE FUNCTION public.price_package_line(_pkg public.packages)
RETURNS TABLE(unit_price numeric, amount numeric, unit text, qty numeric)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
DECLARE
  r_kg      numeric;
  r_cbm     numeric;
  min_kg    numeric;
  min_cbm   numeric;
  qty_kg    numeric;
  qty_cbm   numeric;
  amt_kg    numeric := 0;
  amt_cbm   numeric := 0;
BEGIN
  -- Manual override wins
  IF _pkg.rate_override IS NOT NULL THEN
    IF COALESCE(_pkg.cbm,0) * 167 > COALESCE(_pkg.weight_kg,0) THEN
      RETURN QUERY SELECT _pkg.rate_override,
                          (_pkg.rate_override * COALESCE(_pkg.cbm,0))::numeric,
                          'CBM'::text,
                          COALESCE(_pkg.cbm,0)::numeric;
    ELSE
      RETURN QUERY SELECT _pkg.rate_override,
                          (_pkg.rate_override * COALESCE(_pkg.weight_kg,0))::numeric,
                          'KG'::text,
                          COALESCE(_pkg.weight_kg,0)::numeric;
    END IF;
    RETURN;
  END IF;

  -- Pick best active rate for origin=warehouse_code (falling back to a
  -- rate with no origin set, i.e. a catch-all default)
  SELECT price, min_qty INTO r_kg, min_kg
    FROM public.rates
   WHERE active = true
     AND unit = 'KG'
     AND (origin_code = _pkg.warehouse_code OR origin_code IS NULL)
   ORDER BY (origin_code = _pkg.warehouse_code) DESC, effective_from DESC
   LIMIT 1;

  SELECT price, min_qty INTO r_cbm, min_cbm
    FROM public.rates
   WHERE active = true
     AND unit = 'CBM'
     AND (origin_code = _pkg.warehouse_code OR origin_code IS NULL)
   ORDER BY (origin_code = _pkg.warehouse_code) DESC, effective_from DESC
   LIMIT 1;

  qty_kg  := GREATEST(COALESCE(_pkg.weight_kg,0), COALESCE(min_kg,0));
  qty_cbm := GREATEST(COALESCE(_pkg.cbm,0),       COALESCE(min_cbm,0));

  amt_kg  := COALESCE(r_kg,0)  * qty_kg;
  amt_cbm := COALESCE(r_cbm,0) * qty_cbm;

  -- Charge the higher of the two (standard freight practice)
  IF amt_cbm > amt_kg THEN
    RETURN QUERY SELECT COALESCE(r_cbm,0)::numeric, amt_cbm::numeric, 'CBM'::text, qty_cbm;
  ELSE
    RETURN QUERY SELECT COALESCE(r_kg,0)::numeric,  amt_kg::numeric,  'KG'::text,  qty_kg;
  END IF;
END;
$$;
