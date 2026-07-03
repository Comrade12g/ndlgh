-- Fix: the 'accountant' and 'sales' roles were added to app_role after the
-- financial RLS policies were written, but those policies still only check
-- the old 'sales_accountant' role — which is not assignable from the
-- Admin > Users & roles screen. Result: staff assigned "Accountant" or
-- "Sales" could not create/edit invoices, purchase orders, payments, or
-- ledger entries. This broadens those policies to also accept the new
-- role names so the roles actually work as intended.

-- PURCHASE ORDERS
DROP POLICY IF EXISTS "Admin/accountant full manage PO" ON public.purchase_orders;
CREATE POLICY "Admin/accountant full manage PO" ON public.purchase_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Agents view own PO" ON public.purchase_orders;
CREATE POLICY "Agents view own PO" ON public.purchase_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'sales')
      OR (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid()));

-- INVOICES
DROP POLICY IF EXISTS "Admin/accountant manage invoices" ON public.invoices;
CREATE POLICY "Admin/accountant manage invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

-- INVOICE ITEMS
DROP POLICY IF EXISTS "Admin/accountant manage invoice items" ON public.invoice_items;
CREATE POLICY "Admin/accountant manage invoice items" ON public.invoice_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

-- PAYMENTS
DROP POLICY IF EXISTS "Admin/accountant manage payments" ON public.payments;
CREATE POLICY "Admin/accountant manage payments" ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

-- TRANSACTIONS
DROP POLICY IF EXISTS "Admin/accountant manage transactions" ON public.transactions;
CREATE POLICY "Admin/accountant manage transactions" ON public.transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Agents view own transactions" ON public.transactions;
CREATE POLICY "Agents view own transactions" ON public.transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant')
      OR (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid()));

-- AGENT MARGIN LEDGER
DROP POLICY IF EXISTS "Admin/accountant manage margin ledger" ON public.agent_margin_ledger;
CREATE POLICY "Admin/accountant manage margin ledger" ON public.agent_margin_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant'));

DROP POLICY IF EXISTS "Agents view own margin ledger" ON public.agent_margin_ledger;
CREATE POLICY "Agents view own margin ledger" ON public.agent_margin_ledger FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR public.has_role(auth.uid(),'accountant') OR agent_id = auth.uid());
