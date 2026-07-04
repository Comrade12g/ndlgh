
# Editable Records + Auto-Invoicing at Intake

## 1. Editable fields

Add an "Edit" action (pencil icon) on each row that opens a dialog reusing the intake/creation form pre-filled with existing values.

**Packages** (`_authenticated/packages.tsx`)
- Editable: shipping_mark, warehouse_code, supplier_name, description, pieces, weight_kg, L/W/H (recomputes cbm), external_tracking, notes
- Locked once status is `shipped`, `delivered`, or `closed` (ops/admin can still override)
- Re-matches customer by shipping_mark on save; recomputes invoice line if attached

**Shipments** (`_authenticated/shipments.tsx`)
- Editable: mode, origin/destination warehouse, vessel/flight/AWB, ETD, ETA, status, notes
- Locked once status is `delivered`

**Deliveries** (`_authenticated/deliveries.tsx`)
- Editable: address, contact_phone, driver_id, scheduled_at, delivery_fee, status, notes
- Locked once status is `completed`

Role gating: `admin`, `ops_warehouse` edit packages/shipments; `admin`, `customer_service`, `ops_warehouse` edit deliveries.

## 2. Auto-invoice on intake

Trigger: when a package row is inserted with `status = 'received'` AND `customer_id IS NOT NULL`.

**Database trigger** `trg_package_autoinvoice` (AFTER INSERT on `packages`):
1. Find or create an open draft invoice for `(customer_id, status='draft', shipment_id IS NULL)` — one draft per customer accumulates packages until sent.
2. Look up rate from `public.rates` matching warehouse_code + a default mode ('sea' fallback) → pick rate/kg or rate/CBM based on chargeable weight (max of weight_kg vs cbm × conversion).
3. Insert an `invoice_items` row: description = package description or tracking, qty = 1, unit_price = looked-up rate, amount = qty × chargeable × rate, links `package_id`.
4. Recompute invoice `subtotal`, `total`.

**Manual override**: intake dialog gets an optional "Unit price override" field; when set, trigger uses it instead of rates lookup (stored on `packages.rate_override` — new nullable column).

**On package edit** that changes weight/dims/description: `AFTER UPDATE` trigger re-prices the linked `invoice_items` row (only if parent invoice is still `draft`).

## 3. Groupage invoicing (per-customer + consolidated)

When a shipment is created and packages are attached:

**Per-customer invoices**: existing draft invoices from step 2 get `shipment_id` set and status flipped to `issued`. One invoice per customer per shipment.

**Consolidated shipment invoice**: new row in `invoices` with `is_consolidated = true` (new bool column), `customer_id = NULL`, `shipment_id` set, aggregating all package line items for internal/agent reconciliation. Not sent to customers.

Add a "Generate consolidated invoice" button on the shipment detail; also auto-generated when shipment status → `in_transit`.

## 4. Schema changes

```text
packages           + rate_override numeric NULL
invoices           + is_consolidated bool default false
                   + shipment_id (already exists — confirm)
functions          + fn_autoinvoice_package() 
                   + fn_reprice_package()
                   + fn_generate_consolidated_invoice(shipment_id)
triggers           trg_package_autoinvoice AFTER INSERT
                   trg_package_reprice AFTER UPDATE OF weight_kg, cbm, rate_override
RLS/policies       unchanged (existing invoice policies cover new rows)
```

## 5. UI changes

- `packages.tsx`: add Edit button per row + `EditPackageDialog` (reuses intake form); add optional rate override input to intake dialog.
- `shipments.tsx`: add Edit button + dialog; "Generate consolidated invoice" action.
- `deliveries.tsx`: add Edit button + dialog.
- `invoices.tsx`: badge for consolidated invoices; filter toggle "Show consolidated".

## Technical notes

- Trigger functions use `SECURITY DEFINER` with `SET search_path = public`.
- Rate lookup order: exact (warehouse_code, mode) → fallback (mode) → NULL (line saved as 0, flagged for review).
- Chargeable weight = `GREATEST(weight_kg, cbm * 167)` for air, `GREATEST(weight_kg, cbm * 1000)` for sea — configurable per rate row.
- Edit dialogs validate with the same zod schemas used at creation.
- All edits write to `updated_at` via existing `set_updated_at` trigger.

