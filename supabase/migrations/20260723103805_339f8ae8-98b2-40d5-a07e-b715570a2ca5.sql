
CREATE TABLE public.invite_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_type text NOT NULL CHECK (invite_type IN ('customer','staff')),
  target_user_id uuid,
  target_name text,
  phone text,
  email text,
  role text,
  reused boolean NOT NULL DEFAULT false,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_by_name text,
  whatsapp_status text NOT NULL DEFAULT 'pending' CHECK (whatsapp_status IN ('pending','initiated','failed','skipped')),
  whatsapp_sent_at timestamptz,
  whatsapp_error text,
  email_status text NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending','sent','failed','skipped')),
  email_sent_at timestamptz,
  email_error text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invite_audit_log_created_at_idx ON public.invite_audit_log (created_at DESC);
CREATE INDEX invite_audit_log_invited_by_idx ON public.invite_audit_log (invited_by);
CREATE INDEX invite_audit_log_target_idx ON public.invite_audit_log (target_user_id);

GRANT SELECT, UPDATE ON public.invite_audit_log TO authenticated;
GRANT ALL ON public.invite_audit_log TO service_role;

ALTER TABLE public.invite_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read invite audit"
  ON public.invite_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invite audit"
  ON public.invite_audit_log FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_invite_audit_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER invite_audit_log_updated_at
  BEFORE UPDATE ON public.invite_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.set_invite_audit_updated_at();
