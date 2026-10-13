ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS air_category text;

INSERT INTO public.warehouses (code, name, name_local, country, city, mark_prefix, address, address_local, receiving_hours, phones, notes, sort_order)
VALUES ('WP', 'NDL Air Cargo — Guangzhou', '迦南地国际采购中心', 'China', 'Guangzhou', 'WP',
  'Shop 1037, 1st Floor, Canaan International Procurement Center, No. 94 Guangyuan West Road, Yuexiu District, Guangzhou',
  '广东省广州市越秀区广园西路94号迦南地国际采购中心1楼1037铺',
  NULL, '13428888064',
  'Air cargo: Normal goods $20/kg, Special goods $25/kg, 10–14 days. Parcels are recorded when they arrive in Accra.', 15)
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, name_local=EXCLUDED.name_local, city=EXCLUDED.city,
  mark_prefix=EXCLUDED.mark_prefix, address=EXCLUDED.address, address_local=EXCLUDED.address_local,
  phones=EXCLUDED.phones, notes=EXCLUDED.notes, sort_order=EXCLUDED.sort_order;

CREATE OR REPLACE FUNCTION public.price_package_line(_pkg packages)
 RETURNS TABLE(unit_price numeric, amount numeric, unit text, qty numeric)
 LANGUAGE plpgsql STABLE SET search_path TO 'public'
AS $function$
DECLARE
  r_kg numeric; r_cbm numeric; amt_kg numeric := 0; amt_cbm numeric := 0;
BEGIN
  IF _pkg.air_category IS NOT NULL THEN
    r_kg := CASE WHEN _pkg.air_category = 'special' THEN 25 ELSE 20 END;
    RETURN QUERY SELECT r_kg, round(r_kg * COALESCE(_pkg.weight_kg,0), 2)::numeric, 'KG'::text, COALESCE(_pkg.weight_kg,0)::numeric;
    RETURN;
  END IF;
  IF _pkg.rate_per_cbm IS NOT NULL THEN
    RETURN QUERY SELECT _pkg.rate_per_cbm::numeric, round(_pkg.rate_per_cbm * COALESCE(_pkg.cbm,0), 2)::numeric, 'CBM'::text, COALESCE(_pkg.cbm,0)::numeric;
    RETURN;
  END IF;
  SELECT r.price INTO r_kg FROM public.rates r
   WHERE r.active AND r.unit='KG' AND (r.origin_code=_pkg.warehouse_code OR r.origin_code IS NULL)
   ORDER BY (r.origin_code=_pkg.warehouse_code) DESC, r.effective_from DESC LIMIT 1;
  SELECT r.price INTO r_cbm FROM public.rates r
   WHERE r.active AND r.unit='CBM' AND (r.origin_code=_pkg.warehouse_code OR r.origin_code IS NULL)
   ORDER BY (r.origin_code=_pkg.warehouse_code) DESC, r.effective_from DESC LIMIT 1;
  amt_kg := COALESCE(r_kg,0)*COALESCE(_pkg.weight_kg,0);
  amt_cbm := COALESCE(r_cbm,0)*COALESCE(_pkg.cbm,0);
  IF amt_cbm > amt_kg THEN
    RETURN QUERY SELECT COALESCE(r_cbm,0)::numeric, amt_cbm::numeric, 'CBM'::text, COALESCE(_pkg.cbm,0)::numeric;
  ELSE
    RETURN QUERY SELECT COALESCE(r_kg,0)::numeric, amt_kg::numeric, 'KG'::text, COALESCE(_pkg.weight_kg,0)::numeric;
  END IF;
END;
$function$;

DROP TRIGGER IF EXISTS trg_package_reprice ON public.packages;
CREATE TRIGGER trg_package_reprice AFTER UPDATE OF weight_kg, cbm, description, warehouse_code, customer_id, rate_per_cbm, air_category ON public.packages FOR EACH ROW EXECUTE FUNCTION fn_reprice_package();