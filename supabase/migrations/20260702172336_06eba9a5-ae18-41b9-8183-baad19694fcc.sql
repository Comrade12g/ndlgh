-- ENUMS
CREATE TYPE public.contact_type AS ENUM ('lead','customer','supplier_contact');
CREATE TYPE public.contact_status AS ENUM ('new','active','vip','dormant','blocked');
CREATE TYPE public.package_status AS ENUM ('expected','received','weighed','loaded','in_transit','arrived_gh','ready_delivery','delivered','returned','lost');
CREATE TYPE public.shipment_mode AS ENUM ('sea_lcl','sea_fcl','air','intercity');
CREATE TYPE public.shipment_status AS ENUM ('planning','loading','departed','in_transit','arrived','clearing','cleared','closed','cancelled');
CREATE TYPE public.delivery_status AS ENUM ('scheduled','out_for_delivery','delivered','failed','cancelled');
CREATE TYPE public.sourcing_status AS ENUM ('requested','quoted','approved','purchased','shipped','received','cancelled');
CREATE TYPE public.po_status AS ENUM ('draft','ordered','paid','shipped','received','cancelled');
CREATE TYPE public.invoice_status AS ENUM ('draft','sent','partial','paid','void','overdue');
CREATE TYPE public.payment_method AS ENUM ('cash','bank','mobile_money','card','paystack','other');
CREATE TYPE public.txn_type AS ENUM ('supplier_payment','agent_float','agent_settlement','margin_receipt','customer_receipt','refund','expense','transfer','adjustment');
CREATE TYPE public.txn_direction AS ENUM ('debit','credit');

-- CONTACTS
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  company text, email text, phone text, whatsapp text,
  country text, city text,
  type public.contact_type NOT NULL DEFAULT 'lead',
  status public.contact_status NOT NULL DEFAULT 'new',
  source text, notes text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_contacts_customer ON public.contacts(customer_id);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_assigned ON public.contacts(assigned_to);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage contacts" ON public.contacts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Customers view their own contact" ON public.contacts FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SUPPLIERS
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, country text, city text,
  contact_name text, phone text, email text, wechat text, notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage suppliers" ON public.suppliers FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SOURCING REQUESTS
CREATE TABLE public.sourcing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('SR-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL, description text,
  target_country text DEFAULT 'CN',
  budget_amount numeric(14,2), budget_currency text DEFAULT 'USD',
  status public.sourcing_status NOT NULL DEFAULT 'requested',
  assigned_agent uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sr_customer ON public.sourcing_requests(customer_id);
CREATE INDEX idx_sr_agent ON public.sourcing_requests(assigned_agent);
CREATE INDEX idx_sr_status ON public.sourcing_requests(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sourcing_requests TO authenticated;
GRANT ALL ON public.sourcing_requests TO service_role;
ALTER TABLE public.sourcing_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage sourcing requests" ON public.sourcing_requests FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_sr_updated BEFORE UPDATE ON public.sourcing_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PURCHASE ORDERS
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('PO-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  sourcing_request_id uuid REFERENCES public.sourcing_requests(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  description text, quantity numeric(14,2),
  currency text NOT NULL DEFAULT 'USD',
  supplier_cost numeric(14,2) NOT NULL DEFAULT 0,
  margin_amount numeric(14,2) NOT NULL DEFAULT 0,
  sell_price numeric(14,2) NOT NULL DEFAULT 0,
  status public.po_status NOT NULL DEFAULT 'draft',
  proof_url text, ordered_at timestamptz, received_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_po_agent ON public.purchase_orders(agent_id);
CREATE INDEX idx_po_customer ON public.purchase_orders(customer_id);
CREATE INDEX idx_po_status ON public.purchase_orders(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/accountant full manage PO" ON public.purchase_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'));
CREATE POLICY "Agents view own PO" ON public.purchase_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant')
      OR (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid()));
CREATE POLICY "Agents update own PO" ON public.purchase_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid());
CREATE POLICY "Agents insert own PO" ON public.purchase_orders FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid());
CREATE TRIGGER trg_po_updated BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PACKAGES
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text NOT NULL UNIQUE DEFAULT ('PKG-' || upper(substr(gen_random_uuid()::text, 1, 10))),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  shipping_mark text,
  warehouse_code text REFERENCES public.warehouses(code) ON DELETE SET NULL,
  external_tracking text, supplier_name text, description text,
  pieces integer NOT NULL DEFAULT 1,
  weight_kg numeric(10,3) NOT NULL DEFAULT 0,
  length_cm numeric(10,2), width_cm numeric(10,2), height_cm numeric(10,2),
  cbm numeric(10,4) NOT NULL DEFAULT 0,
  declared_value numeric(14,2), declared_currency text DEFAULT 'USD',
  photos_urls text[] NOT NULL DEFAULT '{}',
  status public.package_status NOT NULL DEFAULT 'received',
  received_at timestamptz DEFAULT now(),
  received_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_packages_customer ON public.packages(customer_id);
CREATE INDEX idx_packages_warehouse ON public.packages(warehouse_code);
CREATE INDEX idx_packages_status ON public.packages(status);
CREATE INDEX idx_packages_mark ON public.packages(shipping_mark);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage packages" ON public.packages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Customers view own packages" ON public.packages FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SHIPMENTS (base + staff policy first)
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('SHP-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  mode public.shipment_mode NOT NULL,
  origin_warehouse text REFERENCES public.warehouses(code) ON DELETE SET NULL,
  destination_warehouse text REFERENCES public.warehouses(code) ON DELETE SET NULL,
  container_no text, bol_no text, vessel_or_flight text,
  etd date, eta date, actual_departure date, actual_arrival date,
  status public.shipment_status NOT NULL DEFAULT 'planning',
  total_cbm numeric(12,4) NOT NULL DEFAULT 0,
  total_weight_kg numeric(12,3) NOT NULL DEFAULT 0,
  freight_cost numeric(14,2) DEFAULT 0, freight_currency text DEFAULT 'USD',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_mode ON public.shipments(mode);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage shipments" ON public.shipments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_shipments_updated BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SHIPMENT_PACKAGES (create BEFORE customer-visibility policy on shipments references it)
CREATE TABLE public.shipment_packages (
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (shipment_id, package_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipment_packages TO authenticated;
GRANT ALL ON public.shipment_packages TO service_role;
ALTER TABLE public.shipment_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage shipment_packages" ON public.shipment_packages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Customers view own shipment_packages" ON public.shipment_packages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.packages p WHERE p.id = shipment_packages.package_id AND p.customer_id = auth.uid()));

-- Now safe to attach customer-view policy on shipments
CREATE POLICY "Customers view shipments containing their packages" ON public.shipments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.shipment_packages sp
    JOIN public.packages p ON p.id = sp.package_id
    WHERE sp.shipment_id = shipments.id AND p.customer_id = auth.uid()
  ));

-- DELIVERIES
CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('DEL-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_name text NOT NULL, recipient_phone text NOT NULL,
  address_line1 text NOT NULL, address_line2 text,
  city text NOT NULL DEFAULT 'Accra', region text,
  driver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_for date,
  status public.delivery_status NOT NULL DEFAULT 'scheduled',
  fee_amount numeric(14,2) DEFAULT 0, fee_currency text DEFAULT 'GHS',
  pod_photo_urls text[] NOT NULL DEFAULT '{}',
  pod_signature_url text, pod_signed_by text,
  delivered_at timestamptz, notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_deliveries_customer ON public.deliveries(customer_id);
CREATE INDEX idx_deliveries_driver ON public.deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage deliveries" ON public.deliveries FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Customers view own deliveries" ON public.deliveries FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
CREATE POLICY "Drivers update assigned deliveries" ON public.deliveries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'driver') AND driver_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'driver') AND driver_id = auth.uid());
CREATE TRIGGER trg_deliveries_updated BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.delivery_packages (
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  PRIMARY KEY (delivery_id, package_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_packages TO authenticated;
GRANT ALL ON public.delivery_packages TO service_role;
ALTER TABLE public.delivery_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage delivery_packages" ON public.delivery_packages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Customers view own delivery_packages" ON public.delivery_packages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.packages p WHERE p.id = delivery_packages.package_id AND p.customer_id = auth.uid()));

-- INVOICES
CREATE SEQUENCE IF NOT EXISTS public.invoice_seq START 1001;
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE DEFAULT ('INV-' || lpad(nextval('public.invoice_seq')::text, 6, '0')),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  delivery_id uuid REFERENCES public.deliveries(id) ON DELETE SET NULL,
  currency text NOT NULL DEFAULT 'GHS',
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  tax numeric(14,2) NOT NULL DEFAULT 0,
  total numeric(14,2) NOT NULL DEFAULT 0,
  amount_paid numeric(14,2) NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date, notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/accountant manage invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'));
CREATE POLICY "Staff view invoices" ON public.invoices FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Customers view own invoices" ON public.invoices FOR SELECT TO authenticated
  USING (customer_id = auth.uid() AND status <> 'draft');
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  description text NOT NULL,
  qty numeric(12,3) NOT NULL DEFAULT 1,
  unit text, unit_price numeric(14,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/accountant manage invoice items" ON public.invoice_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'));
CREATE POLICY "Staff view invoice items" ON public.invoice_items FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Customers view items on own invoices" ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id AND i.customer_id = auth.uid() AND i.status <> 'draft'));

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'GHS',
  method public.payment_method NOT NULL DEFAULT 'cash',
  reference text,
  received_at timestamptz NOT NULL DEFAULT now(),
  received_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/accountant manage payments" ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'));
CREATE POLICY "Staff view payments" ON public.payments FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Customers view own payments" ON public.payments FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  txn_type public.txn_type NOT NULL,
  direction public.txn_direction NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  fx_rate_to_ghs numeric(14,6),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  reference text, proof_url text, notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_txn_agent ON public.transactions(agent_id);
CREATE INDEX idx_txn_type ON public.transactions(txn_type);
CREATE INDEX idx_txn_date ON public.transactions(occurred_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/accountant manage transactions" ON public.transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'));
CREATE POLICY "Agents view own transactions" ON public.transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant')
      OR (public.has_role(auth.uid(),'sourcing_agent') AND agent_id = auth.uid()));

-- AGENT MARGIN LEDGER
CREATE TABLE public.agent_margin_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  entry_type text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'GHS',
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_aml_agent ON public.agent_margin_ledger(agent_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_margin_ledger TO authenticated;
GRANT ALL ON public.agent_margin_ledger TO service_role;
ALTER TABLE public.agent_margin_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/accountant manage margin ledger" ON public.agent_margin_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'));
CREATE POLICY "Agents view own margin ledger" ON public.agent_margin_ledger FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant') OR agent_id = auth.uid());

-- RATES
CREATE TABLE public.rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_code text REFERENCES public.warehouses(code) ON DELETE CASCADE,
  destination_code text REFERENCES public.warehouses(code) ON DELETE CASCADE,
  mode public.shipment_mode NOT NULL,
  unit text NOT NULL,
  price numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rates TO authenticated;
GRANT ALL ON public.rates TO service_role;
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage rates" ON public.rates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'sales_accountant'));
CREATE POLICY "Staff view rates" ON public.rates FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE TRIGGER trg_rates_updated BEFORE UPDATE ON public.rates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.rates (origin_code, destination_code, mode, unit, price, currency, notes) VALUES
  ('CN','GH','sea_lcl','CBM', 350, 'USD', 'Sea groupage China to Ghana per CBM (default)'),
  ('UK','GH','sea_lcl','CBM', 320, 'USD', 'Sea groupage UK to Ghana per CBM (default)'),
  ('AE','GH','sea_lcl','CBM', 300, 'USD', 'Sea groupage Dubai to Ghana per CBM (default)'),
  ('CN','GH','air','KG',    12,  'USD', 'Air China to Ghana per KG (default)'),
  ('UK','GH','air','KG',    10,  'USD', 'Air UK to Ghana per KG (default)'),
  ('AE','GH','air','KG',    9,   'USD', 'Air Dubai to Ghana per KG (default)'),
  ('CN','GH','sea_fcl','container', 4200, 'USD', '20ft FCL China to Ghana (default)'),
  ('GH','GH','intercity','package', 50, 'GHS', 'Intercity last-mile per package (default)');
