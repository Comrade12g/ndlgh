DO $do$
DECLARE src text;
BEGIN
  SELECT pg_get_functiondef('public.import_arrival_manifest(jsonb, public.package_status)'::regprocedure) INTO src;
  src := replace(src, $$_status NOT IN ('in_transit','arrived_gh','ready_delivery')$$, $$_status NOT IN ('received','in_transit','arrived_gh','ready_delivery')$$);
  EXECUTE src;
END
$do$;