
-- 1. Revoke EXECUTE from anon/public on all SECURITY DEFINER functions in public schema
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_shipment_status_invoicing() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_reprice_package() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_autoinvoice_package_manual(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_autoinvoice_package() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fn_generate_consolidated_invoice(uuid) FROM anon, public;

-- Ensure authenticated + used-internally roles retain what's needed
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2. Restrict warehouses SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view warehouses" ON public.warehouses;
CREATE POLICY "Authenticated users can view warehouses"
  ON public.warehouses
  FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.warehouses FROM anon;

-- 3. Add customer self-insert policy on contacts so customers can create their own contact row
CREATE POLICY "Customers can insert their own contact"
  ON public.contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());
