
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin','ops_warehouse','sales_accountant','sales','accountant','customer_service','sourcing_agent','driver')
  );
$$;

DO $$ BEGIN
  BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.contacts ADD CONSTRAINT contacts_customer_fk FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.packages ADD CONSTRAINT packages_customer_fk FOREIGN KEY (customer_id) REFERENCES public.contacts(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.packages ADD CONSTRAINT packages_warehouse_fk FOREIGN KEY (warehouse_code) REFERENCES public.warehouses(code); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.packages ADD CONSTRAINT packages_po_fk FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.shipment_packages ADD CONSTRAINT sp_shipment_fk FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.shipment_packages ADD CONSTRAINT sp_package_fk FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.deliveries ADD CONSTRAINT deliveries_customer_fk FOREIGN KEY (customer_id) REFERENCES public.contacts(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.deliveries ADD CONSTRAINT deliveries_driver_fk FOREIGN KEY (driver_id) REFERENCES auth.users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.delivery_packages ADD CONSTRAINT dp_delivery_fk FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.delivery_packages ADD CONSTRAINT dp_package_fk FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.invoices ADD CONSTRAINT invoices_customer_fk FOREIGN KEY (customer_id) REFERENCES public.contacts(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.invoices ADD CONSTRAINT invoices_shipment_fk FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.invoices ADD CONSTRAINT invoices_delivery_fk FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.invoice_items ADD CONSTRAINT items_invoice_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.invoice_items ADD CONSTRAINT items_package_fk FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.payments ADD CONSTRAINT payments_invoice_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.payments ADD CONSTRAINT payments_customer_fk FOREIGN KEY (customer_id) REFERENCES public.contacts(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.sourcing_requests ADD CONSTRAINT sr_customer_fk FOREIGN KEY (customer_id) REFERENCES public.contacts(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.purchase_orders ADD CONSTRAINT po_supplier_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.purchase_orders ADD CONSTRAINT po_customer_fk FOREIGN KEY (customer_id) REFERENCES public.contacts(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.purchase_orders ADD CONSTRAINT po_agent_fk FOREIGN KEY (agent_id) REFERENCES auth.users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.purchase_orders ADD CONSTRAINT po_sr_fk FOREIGN KEY (sourcing_request_id) REFERENCES public.sourcing_requests(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.rates ADD CONSTRAINT rates_origin_fk FOREIGN KEY (origin_code) REFERENCES public.warehouses(code); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.rates ADD CONSTRAINT rates_dest_fk FOREIGN KEY (destination_code) REFERENCES public.warehouses(code); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.transactions ADD CONSTRAINT tx_customer_fk FOREIGN KEY (customer_id) REFERENCES public.contacts(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.transactions ADD CONSTRAINT tx_supplier_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.transactions ADD CONSTRAINT tx_agent_fk FOREIGN KEY (agent_id) REFERENCES auth.users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.transactions ADD CONSTRAINT tx_invoice_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.transactions ADD CONSTRAINT tx_payment_fk FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.transactions ADD CONSTRAINT tx_po_fk FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.agent_margin_ledger ADD CONSTRAINT aml_agent_fk FOREIGN KEY (agent_id) REFERENCES auth.users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.agent_margin_ledger ADD CONSTRAINT aml_po_fk FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER TABLE public.agent_margin_ledger ADD CONSTRAINT aml_tx_fk FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
