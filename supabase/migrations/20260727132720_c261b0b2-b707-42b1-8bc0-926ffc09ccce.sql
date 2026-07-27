-- Public function for shipment tracking (returns only safe, non-PII columns)
CREATE OR REPLACE FUNCTION public.get_public_shipment_status(_ref text)
RETURNS TABLE(
  ndl_reference text,
  origin_city text,
  destination_city text,
  current_milestone shipment_milestone,
  current_eta date,
  eta_last_changed_at timestamp with time zone,
  eta_recently_changed boolean,
  mode shipment_mode
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.ndl_reference,
    COALESCE(s.port_of_loading, wo.name, s.origin_warehouse) AS origin_city,
    COALESCE(s.port_of_discharge, wd.name, s.destination_warehouse, 'Tema, Ghana') AS destination_city,
    s.current_milestone,
    s.eta AS current_eta,
    s.eta_last_changed_at,
    (s.eta_last_changed_at IS NOT NULL AND s.eta_last_changed_at > now() - interval '7 days') AS eta_recently_changed,
    s.mode
  FROM public.shipments s
  LEFT JOIN public.warehouses wo ON wo.code = s.origin_warehouse
  LEFT JOIN public.warehouses wd ON wd.code = s.destination_warehouse
  WHERE s.ndl_reference = _ref
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_shipment_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_shipment_status(text) TO anon, authenticated;

-- Public read on active rates for the marketing quote engine
GRANT SELECT ON public.rates TO anon;

DROP POLICY IF EXISTS "Public can read active rates" ON public.rates;
CREATE POLICY "Public can read active rates"
  ON public.rates
  FOR SELECT
  TO anon
  USING (active = true);
