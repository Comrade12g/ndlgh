
-- Recreate the re-pricing trigger without the rate_override column reference,
-- then drop the column itself.
DROP TRIGGER IF EXISTS trg_package_reprice ON public.packages;

-- Recreate price_package_line WITHOUT the override branch
CREATE OR REPLACE FUNCTION public.price_package_line(_pkg public.packages)
RETURNS TABLE(unit_price numeric, amount numeric, unit text, qty numeric)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
DECLARE
  r_kg   numeric;
  r_cbm  numeric;
  amt_kg numeric := 0;
  amt_cbm numeric := 0;
BEGIN
  SELECT price INTO r_kg
    FROM public.rates
   WHERE active = true
     AND unit = 'KG'
     AND (origin_code = _pkg.warehouse_code OR origin_code IS NULL)
   ORDER BY (origin_code = _pkg.warehouse_code) DESC, effective_from DESC
   LIMIT 1;

  SELECT price INTO r_cbm
    FROM public.rates
   WHERE active = true
     AND unit = 'CBM'
     AND (origin_code = _pkg.warehouse_code OR origin_code IS NULL)
   ORDER BY (origin_code = _pkg.warehouse_code) DESC, effective_from DESC
   LIMIT 1;

  amt_kg  := COALESCE(r_kg,0)  * COALESCE(_pkg.weight_kg,0);
  amt_cbm := COALESCE(r_cbm,0) * COALESCE(_pkg.cbm,0);

  IF amt_cbm > amt_kg THEN
    RETURN QUERY SELECT COALESCE(r_cbm,0)::numeric, amt_cbm::numeric, 'CBM'::text, COALESCE(_pkg.cbm,0)::numeric;
  ELSE
    RETURN QUERY SELECT COALESCE(r_kg,0)::numeric,  amt_kg::numeric,  'KG'::text,  COALESCE(_pkg.weight_kg,0)::numeric;
  END IF;
END;
$$;

-- Drop the column
ALTER TABLE public.packages DROP COLUMN IF EXISTS rate_override;

-- Recreate the reprice trigger without rate_override in the OF list
CREATE TRIGGER trg_package_reprice
AFTER UPDATE OF weight_kg, cbm, description, warehouse_code, customer_id ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.fn_reprice_package();
