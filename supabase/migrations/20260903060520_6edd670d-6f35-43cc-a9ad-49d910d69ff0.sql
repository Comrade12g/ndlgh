DROP POLICY IF EXISTS "Customers view own invoices" ON public.invoices;
CREATE POLICY "Customers view own invoices" ON public.invoices FOR SELECT TO authenticated USING (customer_id = auth.uid());
DROP POLICY IF EXISTS "Customers view items on own invoices" ON public.invoice_items;
CREATE POLICY "Customers view items on own invoices" ON public.invoice_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND i.customer_id = auth.uid()));