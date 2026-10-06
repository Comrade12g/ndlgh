DROP POLICY "Authenticated users can view warehouses" ON public.warehouses;
CREATE POLICY "Signed-in users can view public warehouses" ON public.warehouses
  FOR SELECT TO authenticated USING (is_public = true OR public.is_staff(auth.uid()));
DROP POLICY "Public can read gallery bucket" ON storage.objects;
CREATE POLICY "Admins can read gallery bucket objects" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));