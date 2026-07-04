
-- ============================================================
-- 1. Schema additions
-- ============================================================
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS rate_override numeric(14,2);

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS is_consolidated boolean NOT NULL DEFAULT false;

-- Consolidated invoices have no customer; loosen NOT NULL
ALTER TABLE public.invoices
  ALTER COLUMN customer_id DROP NOT NULL;

-- ============================================================
-- 2. Rate lookup + line pricing helpers
-- ============================================================
CREATE OR REPLACE FUNCTION public.price_package_line(_pkg public.packages)
RETURNS TABLE(unit_price numeric, amount numeric, unit text, qty numeric)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
DECLARE
  r_kg   numeric;
  r_cbm  numeric;
  amt_kg numeric := 0;
  amt_cbm numeric := 0;
BEGIN
  -- Manual override wins
  IF _pkg.rate_override IS NOT NULL THEN
    -- Override is per kg by default; if CBM is greater than weight, treat as per CBM.
    IF COALESCE(_pkg.cbm,0) * 167 > COALESCE(_pkg.weight_kg,0) THEN
      RETURN QUERY SELECT _pkg.rate_override,
                          (_pkg.rate_override * COALESCE(_pkg.cbm,0))::numeric,
                          'CBM'::text,
                          COALESCE(_pkg.cbm,0)::numeric;
    ELSE
      RETURN QUERY SELECT _pkg.rate_override,
                          (_pkg.rate_override * COALESCE(_pkg.weight_kg,0))::numeric,
                          'KG'::text,
                          COALESCE(_pkg.weight_kg,0)::numeric;
    END IF;
    RETURN;
  END IF;

  -- Pick best active rate for origin=warehouse_code
  SELECT price INTO r_kg
    FROM public.rates
   WHERE active = true
     AND unit = 'KG'
     AND (origin_code = _pkg.warehouse_code OR origin_code IS NULL)
   ORDER BY (origin_code = _pkg.warehouse_code) DESC, effective_from DESC
   LIMIT 1;

  SELECT price INTO r_cbm
    FROM public.rates
   WHERE active = true
     AND unit = 'CBM'
     AND (origin_code = _pkg.warehouse_code OR origin_code IS NULL)
   ORDER BY (origin_code = _pkg.warehouse_code) DESC, effective_from DESC
   LIMIT 1;

  amt_kg  := COALESCE(r_kg,0)  * COALESCE(_pkg.weight_kg,0);
  amt_cbm := COALESCE(r_cbm,0) * COALESCE(_pkg.cbm,0);

  -- Charge the higher of the two (standard freight practice)
  IF amt_cbm > amt_kg THEN
    RETURN QUERY SELECT COALESCE(r_cbm,0)::numeric, amt_cbm::numeric, 'CBM'::text, COALESCE(_pkg.cbm,0)::numeric;
  ELSE
    RETURN QUERY SELECT COALESCE(r_kg,0)::numeric,  amt_kg::numeric,  'KG'::text,  COALESCE(_pkg.weight_kg,0)::numeric;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_invoice_totals(_invoice_id uuid)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE public.invoices i
     SET subtotal = COALESCE((SELECT SUM(amount) FROM public.invoice_items WHERE invoice_id = _invoice_id),0),
         total    = COALESCE((SELECT SUM(amount) FROM public.invoice_items WHERE invoice_id = _invoice_id),0) + i.tax
   WHERE i.id = _invoice_id;
$$;

-- ============================================================
-- 3. Auto-invoice on package intake
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_autoinvoice_package()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_price record;
  v_desc text;
BEGIN
  IF NEW.customer_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find or create the customer's open draft invoice (not yet attached to a shipment)
  SELECT id INTO v_invoice_id
    FROM public.invoices
   WHERE customer_id = NEW.customer_id
     AND status = 'draft'
     AND shipment_id IS NULL
     AND is_consolidated = false
   ORDER BY created_at DESC
   LIMIT 1;

  IF v_invoice_id IS NULL THEN
    INSERT INTO public.invoices (customer_id, currency, status, created_by)
    VALUES (NEW.customer_id, 'GHS', 'draft', NEW.received_by)
    RETURNING id INTO v_invoice_id;
  END IF;

  SELECT * INTO v_price FROM public.price_package_line(NEW);

  v_desc := COALESCE(NULLIF(NEW.description,''), 'Freight') || ' — ' || NEW.tracking_code;

  INSERT INTO public.invoice_items (invoice_id, package_id, description, qty, unit, unit_price, amount)
  VALUES (v_invoice_id, NEW.id, v_desc, v_price.qty, v_price.unit, v_price.unit_price, v_price.amount);

  PERFORM public.recompute_invoice_totals(v_invoice_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_package_autoinvoice ON public.packages;
CREATE TRIGGER trg_package_autoinvoice
AFTER INSERT ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.fn_autoinvoice_package();

-- ============================================================
-- 4. Re-price on package edit (only while parent invoice is draft)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_reprice_package()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price record;
  v_item record;
  v_desc text;
BEGIN
  -- If customer_id was added after the fact, delegate to autoinvoice
  IF OLD.customer_id IS NULL AND NEW.customer_id IS NOT NULL THEN
    PERFORM public.fn_autoinvoice_package_manual(NEW.id);
    RETURN NEW;
  END IF;

  SELECT ii.*, inv.status AS invoice_status
    INTO v_item
    FROM public.invoice_items ii
    JOIN public.invoices inv ON inv.id = ii.invoice_id
   WHERE ii.package_id = NEW.id
     AND inv.is_consolidated = false
   ORDER BY ii.created_at DESC
   LIMIT 1;

  IF v_item.id IS NULL OR v_item.invoice_status <> 'draft' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_price FROM public.price_package_line(NEW);
  v_desc := COALESCE(NULLIF(NEW.description,''), 'Freight') || ' — ' || NEW.tracking_code;

  UPDATE public.invoice_items
     SET description = v_desc,
         qty = v_price.qty,
         unit = v_price.unit,
         unit_price = v_price.unit_price,
         amount = v_price.amount
   WHERE id = v_item.id;

  PERFORM public.recompute_invoice_totals(v_item.invoice_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_autoinvoice_package_manual(_package_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pkg public.packages;
  v_invoice_id uuid;
  v_price record;
  v_desc text;
BEGIN
  SELECT * INTO v_pkg FROM public.packages WHERE id = _package_id;
  IF v_pkg.customer_id IS NULL THEN RETURN; END IF;

  -- Skip if a line already exists
  IF EXISTS (SELECT 1 FROM public.invoice_items WHERE package_id = _package_id) THEN RETURN; END IF;

  SELECT id INTO v_invoice_id
    FROM public.invoices
   WHERE customer_id = v_pkg.customer_id AND status = 'draft'
     AND shipment_id IS NULL AND is_consolidated = false
   ORDER BY created_at DESC LIMIT 1;

  IF v_invoice_id IS NULL THEN
    INSERT INTO public.invoices (customer_id, currency, status)
    VALUES (v_pkg.customer_id, 'GHS', 'draft')
    RETURNING id INTO v_invoice_id;
  END IF;

  SELECT * INTO v_price FROM public.price_package_line(v_pkg);
  v_desc := COALESCE(NULLIF(v_pkg.description,''), 'Freight') || ' — ' || v_pkg.tracking_code;

  INSERT INTO public.invoice_items (invoice_id, package_id, description, qty, unit, unit_price, amount)
  VALUES (v_invoice_id, v_pkg.id, v_desc, v_price.qty, v_price.unit, v_price.unit_price, v_price.amount);

  PERFORM public.recompute_invoice_totals(v_invoice_id);
END;
$$;

DROP TRIGGER IF EXISTS trg_package_reprice ON public.packages;
CREATE TRIGGER trg_package_reprice
AFTER UPDATE OF weight_kg, cbm, rate_override, description, warehouse_code, customer_id ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.fn_reprice_package();

-- ============================================================
-- 5. Consolidated shipment invoice generator
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_generate_consolidated_invoice(_shipment_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid;
  v_pkg public.packages;
  v_price record;
  v_desc text;
BEGIN
  -- Reuse existing consolidated invoice for this shipment if one exists
  SELECT id INTO v_invoice_id
    FROM public.invoices
   WHERE shipment_id = _shipment_id AND is_consolidated = true
   LIMIT 1;

  IF v_invoice_id IS NULL THEN
    INSERT INTO public.invoices (shipment_id, currency, status, is_consolidated, customer_id)
    VALUES (_shipment_id, 'USD', 'draft', true, NULL)
    RETURNING id INTO v_invoice_id;
  ELSE
    -- Rebuild lines to keep it in sync
    DELETE FROM public.invoice_items WHERE invoice_id = v_invoice_id;
  END IF;

  FOR v_pkg IN
    SELECT p.* FROM public.packages p
    JOIN public.shipment_packages sp ON sp.package_id = p.id
    WHERE sp.shipment_id = _shipment_id
  LOOP
    SELECT * INTO v_price FROM public.price_package_line(v_pkg);
    v_desc := COALESCE(v_pkg.shipping_mark,'unmatched') || ' · '
           || COALESCE(NULLIF(v_pkg.description,''),'Freight') || ' — ' || v_pkg.tracking_code;
    INSERT INTO public.invoice_items (invoice_id, package_id, description, qty, unit, unit_price, amount)
    VALUES (v_invoice_id, v_pkg.id, v_desc, v_price.qty, v_price.unit, v_price.unit_price, v_price.amount);
  END LOOP;

  PERFORM public.recompute_invoice_totals(v_invoice_id);
  RETURN v_invoice_id;
END;
$$;

-- ============================================================
-- 6. When a shipment departs, finalize customer invoices + build consolidated
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_shipment_status_invoicing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  IF NEW.status IN ('departed','in_transit','arrived','clearing','cleared') THEN
    -- Attach draft customer invoices to this shipment + mark them sent
    UPDATE public.invoices inv
       SET shipment_id = NEW.id,
           status = 'sent'
     WHERE inv.shipment_id IS NULL
       AND inv.is_consolidated = false
       AND inv.status = 'draft'
       AND inv.customer_id IN (
         SELECT DISTINCT p.customer_id
           FROM public.packages p
           JOIN public.shipment_packages sp ON sp.package_id = p.id
          WHERE sp.shipment_id = NEW.id
            AND p.customer_id IS NOT NULL
       );

    -- Auto-generate consolidated invoice
    PERFORM public.fn_generate_consolidated_invoice(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_shipment_status_invoicing ON public.shipments;
CREATE TRIGGER trg_shipment_status_invoicing
AFTER UPDATE OF status ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.fn_shipment_status_invoicing();

-- ============================================================
-- 7. Grants for the new RPC (callable from the app)
-- ============================================================
GRANT EXECUTE ON FUNCTION public.fn_generate_consolidated_invoice(uuid) TO authenticated;
