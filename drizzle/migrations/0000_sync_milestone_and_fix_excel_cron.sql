CREATE OR REPLACE FUNCTION public.fn_shipment_sync_milestone()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.current_milestone := CASE NEW.status
      WHEN 'departed' THEN 'departed_origin'
      WHEN 'in_transit' THEN 'in_transit'
      WHEN 'arrived' THEN 'arrived_tema'
      WHEN 'clearing' THEN 'customs_clearance'
      WHEN 'cleared' THEN 'out_for_delivery'
      WHEN 'closed' THEN 'delivered'
      WHEN 'cancelled' THEN NEW.current_milestone
      ELSE 'picked_up'
    END::shipment_milestone;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_shipment_sync_milestone ON public.shipments;
CREATE TRIGGER trg_shipment_sync_milestone
BEFORE INSERT OR UPDATE OF status ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.fn_shipment_sync_milestone();

DO $$ BEGIN PERFORM cron.unschedule('excel-sync-daily'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('excel-sync-15min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('excel-sync-daily', '0 0 * * *', $c$
  SELECT net.http_post(
    url := 'https://project--bd2eb753-0b32-4ea1-b527-dcb06a5a7c2d.lovable.app/api/public/hooks/excel-sync',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-token',(SELECT token FROM public.internal_cron_tokens WHERE name='excel_sync')),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
$c$);