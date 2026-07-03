-- Fix: migration 20260702173944 attempted to "ensure" foreign keys that
-- were already correctly defined inline when each table was created. Every
-- single constraint it added was either (a) a pure duplicate of an
-- existing correct FK — which confuses PostgREST's relationship detection
-- and forces every embedded select (e.g. `suppliers:supplier_id(...)`) to
-- fail with "more than one relationship was found" — or (b) actively wrong,
-- pointing customer_id columns at public.contacts instead of the correct
-- public.profiles (see previous migration in this batch). None of these
-- constraints add anything the schema didn't already have correctly in
-- place, so we drop them all.

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

