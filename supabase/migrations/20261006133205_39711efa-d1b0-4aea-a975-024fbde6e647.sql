-- lovable-cron-fallback-reviewed: user explicitly chose 15-minute Excel backup cadence; OneDrive offers no push, this is time-based snapshotting
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE TABLE public.internal_cron_tokens (
  name text PRIMARY KEY,
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.internal_cron_tokens TO service_role;
ALTER TABLE public.internal_cron_tokens ENABLE ROW LEVEL SECURITY;
INSERT INTO public.internal_cron_tokens (name) VALUES ('excel_sync');
CREATE TABLE public.excel_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL,
  rows_synced integer,
  error text
);
GRANT SELECT ON public.excel_sync_log TO authenticated;
GRANT ALL ON public.excel_sync_log TO service_role;
ALTER TABLE public.excel_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view excel sync log" ON public.excel_sync_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
SELECT cron.schedule('excel-sync-15min', '*/15 * * * *', $$
  SELECT net.http_post(
    url := 'https://project--bd2eb753-0b32-4ea1-b527-dcb06a5a7c2d.lovable.app/api/public/hooks/excel-sync',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-token',(SELECT token FROM public.internal_cron_tokens WHERE name='excel_sync')),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
$$);