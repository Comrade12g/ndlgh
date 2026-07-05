-- 1) Broaden financial RLS policies to accept new 'accountant' and 'sales' roles
DROP POLICY IF EXISTS "Admin/accountant full manage PO" ON public.purchase_orders;
CREATE POLICY "Admin/accountant full manage PO" ON public.purchase_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Agents view own PO" ON public.purchase_orders;
CREATE POLICY "Agents view own PO" ON public.purchase_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'sales')
      OR (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid()));

DROP POLICY IF EXISTS "Admin/accountant manage invoices" ON public.invoices;
CREATE POLICY "Admin/accountant manage invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Admin/accountant manage invoice items" ON public.invoice_items;
CREATE POLICY "Admin/accountant manage invoice items" ON public.invoice_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Admin/accountant manage payments" ON public.payments;
CREATE POLICY "Admin/accountant manage payments" ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Admin/accountant manage transactions" ON public.transactions;
CREATE POLICY "Admin/accountant manage transactions" ON public.transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Agents view own transactions" ON public.transactions;
CREATE POLICY "Agents view own transactions" ON public.transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant')
      OR (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid()));

DROP POLICY IF EXISTS "Admin/accountant manage margin ledger" ON public.agent_margin_ledger;
CREATE POLICY "Admin/accountant manage margin ledger" ON public.agent_margin_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Agents view own margin ledger" ON public.agent_margin_ledger;
CREATE POLICY "Agents view own margin ledger" ON public.agent_margin_ledger FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant') OR agent_id = auth.uid());

-- 2) Drop erroneous / duplicate FKs that point customer_id at contacts
--    and create embedding ambiguity in PostgREST.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fk;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_fk;
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_customer_fk;
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_customer_fk;
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_warehouse_fk;
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_po_fk;
ALTER TABLE public.shipment_packages DROP CONSTRAINT IF EXISTS sp_shipment_fk;
ALTER TABLE public.shipment_packages DROP CONSTRAINT IF EXISTS sp_package_fk;
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_customer_fk;
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_driver_fk;
ALTER TABLE public.delivery_packages DROP CONSTRAINT IF EXISTS dp_delivery_fk;
ALTER TABLE public.delivery_packages DROP CONSTRAINT IF EXISTS dp_package_fk;
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_customer_fk;
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_shipment_fk;
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_delivery_fk;
ALTER TABLE public.invoice_items DROP CONSTRAINT IF EXISTS items_invoice_fk;
ALTER TABLE public.invoice_items DROP CONSTRAINT IF EXISTS items_package_fk;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_invoice_fk;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_customer_fk;
ALTER TABLE public.sourcing_requests DROP CONSTRAINT IF EXISTS sr_customer_fk;
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS po_supplier_fk;
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS po_customer_fk;
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS po_agent_fk;
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS po_sr_fk;
ALTER TABLE public.rates DROP CONSTRAINT IF EXISTS rates_origin_fk;
ALTER TABLE public.rates DROP CONSTRAINT IF EXISTS rates_dest_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_customer_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_supplier_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_agent_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_invoice_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_payment_fk;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS tx_po_fk;
ALTER TABLE public.agent_margin_ledger DROP CONSTRAINT IF EXISTS aml_agent_fk;
ALTER TABLE public.agent_margin_ledger DROP CONSTRAINT IF EXISTS aml_po_fk;
ALTER TABLE public.agent_margin_ledger DROP CONSTRAINT IF EXISTS aml_tx_fk;

-- 3) Skip auto-assigning 'customer' role for staff sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  );

  IF NEW.raw_user_meta_data->>'account_type' IS DISTINCT FROM 'staff' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;