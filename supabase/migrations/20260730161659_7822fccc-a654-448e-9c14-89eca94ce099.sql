CREATE OR REPLACE FUNCTION public.get_public_shipment_status(_ref text)
 RETURNS TABLE(ndl_reference text, origin_city text, destination_city text, current_milestone shipment_milestone, current_eta date, eta_last_changed_at timestamp with time zone, eta_recently_changed boolean, mode shipment_mode)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH target AS (
    SELECT s.*
    FROM public.shipments s
    WHERE upper(s.ndl_reference) = upper(_ref)
    UNION ALL
    SELECT s.*
    FROM public.packages p
    JOIN public.shipment_packages sp ON sp.package_id = p.id
    JOIN public.shipments s ON s.id = sp.shipment_id
    WHERE upper(coalesce(p.shipping_mark,'')) = upper(_ref)
       OR upper(coalesce(p.tracking_code,'')) = upper(_ref)
    ORDER BY 1
  )
  SELECT
    s.ndl_reference,
    COALESCE(s.port_of_loading, wo.name, s.origin_warehouse) AS origin_city,
    COALESCE(s.port_of_discharge, wd.name, s.destination_warehouse, 'Tema, Ghana') AS destination_city,
    s.current_milestone,
    s.eta AS current_eta,
    s.eta_last_changed_at,
    (s.eta_last_changed_at IS NOT NULL AND s.eta_last_changed_at > now() - interval '7 days') AS eta_recently_changed,
    s.mode
  FROM target s
  LEFT JOIN public.warehouses wo ON wo.code = s.origin_warehouse
  LEFT JOIN public.warehouses wd ON wd.code = s.destination_warehouse
  LIMIT 1;
$function$;