DROP FUNCTION IF EXISTS public.get_public_shipment_status(text);

CREATE FUNCTION public.get_public_shipment_status(_ref text)
RETURNS TABLE(
  ndl_reference text,
  origin_city text,
  destination_city text,
  current_milestone shipment_milestone,
  current_eta date,
  eta_last_changed_at timestamptz,
  eta_recently_changed boolean,
  mode shipment_mode,
  matched_mark text,
  etd date,
  original_eta date,
  actual_departure date,
  actual_arrival date,
  last_checked_at timestamptz,
  vessel_or_flight text,
  carrier text,
  pieces integer,
  weight_kg numeric,
  cbm numeric,
  package_count integer,
  received_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH target AS (
    SELECT s.*, NULL::text AS m_mark, NULL::integer AS m_pieces,
           NULL::numeric AS m_weight, NULL::numeric AS m_cbm, NULL::timestamptz AS m_received
    FROM public.shipments s
    WHERE upper(s.ndl_reference) = upper(_ref)
    UNION ALL
    SELECT s.*, p.shipping_mark, p.pieces, p.weight_kg, p.cbm, p.received_at
    FROM public.packages p
    JOIN public.shipment_packages sp ON sp.package_id = p.id
    JOIN public.shipments s ON s.id = sp.shipment_id
    WHERE upper(coalesce(p.shipping_mark,'')) = upper(_ref)
       OR upper(coalesce(p.tracking_code,'')) = upper(_ref)
  ), pick AS (
    SELECT * FROM target ORDER BY m_mark NULLS LAST LIMIT 1
  ), agg AS (
    SELECT sp.shipment_id, count(*)::integer AS cnt,
           sum(coalesce(p.pieces,1))::integer AS total_pieces,
           sum(coalesce(p.weight_kg,0))::numeric AS total_weight,
           sum(coalesce(p.cbm,0))::numeric AS total_cbm
    FROM public.shipment_packages sp
    JOIN public.packages p ON p.id = sp.package_id
    GROUP BY sp.shipment_id
  )
  SELECT
    s.ndl_reference,
    COALESCE(s.port_of_loading, wo.name, s.origin_warehouse) AS origin_city,
    COALESCE(s.port_of_discharge, wd.name, s.destination_warehouse, 'Tema, Ghana') AS destination_city,
    s.current_milestone,
    s.eta AS current_eta,
    s.eta_last_changed_at,
    (s.eta_last_changed_at IS NOT NULL AND s.eta_last_changed_at > now() - interval '7 days') AS eta_recently_changed,
    s.mode,
    s.m_mark AS matched_mark,
    s.etd,
    s.original_eta,
    s.actual_departure,
    s.actual_arrival,
    s.last_checked_at,
    s.vessel_or_flight,
    s.carrier,
    COALESCE(s.m_pieces, a.total_pieces) AS pieces,
    COALESCE(s.m_weight, a.total_weight) AS weight_kg,
    COALESCE(s.m_cbm, a.total_cbm) AS cbm,
    COALESCE(a.cnt, 0) AS package_count,
    s.m_received AS received_at
  FROM pick s
  LEFT JOIN public.warehouses wo ON wo.code = s.origin_warehouse
  LEFT JOIN public.warehouses wd ON wd.code = s.destination_warehouse
  LEFT JOIN agg a ON a.shipment_id = s.id;
$function$;

REVOKE ALL ON FUNCTION public.get_public_shipment_status(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_shipment_status(text) TO service_role;