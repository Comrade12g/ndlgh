-- Fix packages.customer_id: it should reference profiles (customers), not contacts
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_customer_fk;

-- Allow admins to manage user_roles from the app
GRANT INSERT, DELETE, UPDATE ON public.user_roles TO authenticated;

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));