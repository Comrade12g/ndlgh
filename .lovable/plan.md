
# NDL Ghana — CRM, Sourcing, Treasury & Shipping Ops Platform

End-to-end control tower for NDL Ghana: sourcing/procurement in China (and UK/Dubai), multi-country payments ledger, warehouse + shipment ops, CRM, invoicing, and customer self-service portal. Overseas → Ghana door: sea LCL, FCL, air, and intercity.

## Brand & Design

- **Orange** `#F58220` · **Navy** `#0A2E5C` · **Sky** `#1E7FD1` · bg `#F7F9FC`
- Plus Jakarta Sans (headings) + Inter (body) via `@fontsource`
- NDL Ghana logo in sidebar, auth, portal, favicon
- Status chips throughout, dense ops tables, crisp cards

## Locked Decisions

| Area | Value |
|---|---|
| Currency | Multi-currency (GHS, USD, GBP, CNY, AED); manual daily FX rate per currency; FX snapshot stored on every transaction |
| Shipping mark | `NDL-GH-#####` auto-sequential (DB trigger on customer signup) |
| Rate units | Sea LCL / CBM · Air / kg · FCL flat 20ft/40ft · Intercity / package |
| Package media | Photos at intake · Signature + photo POD |
| Sourcing model | You get a supplier rate → add margin → quote customer. Agent pays supplier, uploads proof; agent later pays the margin into a company account. System tracks proof + margin owed per agent. |
| Customer sourcing view | Internal only — customers see the parcel once it reaches the warehouse |

## Roles

- `admin` — everything
- `ops_warehouse` — packages, shipments, deliveries
- `sales_accountant` — CRM, quotes, invoices, customer payments
- `sourcing_agent` — own POs, own supplier payments, upload proof, own margin-owed balance
- `driver` — assigned deliveries + POD only
- `customer` — portal only (own packages/invoices)

Roles stored in `user_roles` table with `has_role()` security-definer function.

## Data Model (Lovable Cloud / Postgres — RLS + GRANTs on every table)

```text
profiles(id, full_name, phone, shipping_mark, default_origin)
user_roles(user_id, role)
warehouses(code, country, address)             -- CN, UK, AE, GH-Accra
companies · contacts · leads · quotes · quote_items

-- Sourcing / Procurement
suppliers(name, contact, wechat, country, categories, payment_prefs, rating)
sourcing_requests(customer_id, description, links[], images[], qty,
                  target_price, status, assigned_agent_id)
purchase_orders(ref, sourcing_request_id, supplier_id, agent_id,
                supplier_price, currency, margin, margin_currency,
                customer_price, deposit_pct, status,
                expected_ready_date, notes)
po_items · po_events

-- Treasury / Payments Ledger
accounts(name, owner_type [company|agent], owner_id, country,
         currency, method [bank|momo|alipay|wechat|cash])
fx_rates(currency, rate_to_ghs, effective_date)  -- admin-set daily
transactions(type, from_account_id, to_account_id, amount, currency,
             fx_rate_snapshot, linked_po_id, linked_invoice_id,
             linked_customer_id, proof_url, status [pending|confirmed|rejected],
             created_by, confirmed_by, note)
agent_margin_ledger(agent_id, po_id, margin_amount, currency,
                    status [owed|paid], settled_transaction_id)

-- Shipping
packages(tracking_no, customer_id, origin_wh, weight_kg, dims, cbm,
         declared_value, currency, photos[], status, received_at,
         shipment_id, source_po_id)
shipments(ref, mode, container_no, container_size, origin_wh, eta, status)
shipment_events(shipment_id|package_id, event, note, at, by_user)

-- Billing
rate_cards(origin_wh, mode, unit, unit_price, currency, min_charge, effective_from)
invoices(number, customer_id, currency, subtotal, tax, total,
         fx_to_ghs, status)
invoice_items · payments(method, currency, amount, reference, transaction_id)

-- Dispatch
deliveries(shipment_id|package_id, driver_id, run_date,
           pod_signature_url, pod_photo_url, delivered_at)
vehicles · drivers
```

Storage buckets (all private, RLS scoped): `package-photos`, `pod`, `payment-proofs`, `sourcing-images`. Public bucket: `logos` only.

## The Sourcing → Payment → Shipping Flow

1. Customer request (or sales creates) → **Sourcing Request**
2. Admin/agent finds supplier → creates **PO** with supplier rate + your margin → customer quoted the total
3. Agent pays supplier from their assigned account → logs **Transaction** (type `supplier_payment`) + uploads proof photo → admin reviews → confirms
4. System auto-creates **agent_margin_ledger** entry (agent owes company the margin in the agreed currency)
5. Agent pays margin into a company account → logs **Transaction** (type `agent_margin_settlement`) with proof → admin confirms → margin ledger marked paid
6. Goods ready → PO linked to a **Package** at origin warehouse (no re-entry)
7. Package flows through normal shipping pipeline → delivered to customer
8. Customer invoice generated from rate card + PO customer price → payments recorded

Every step generates a ledger entry with FX snapshot to GHS, so at any time you can see:
- Cash in each account / country / currency
- Outstanding margin per agent (unpaid, overdue)
- Unconfirmed transactions (red flag list)
- True cost of any shipment/customer/PO

## Dashboards

- **Admin overview** — cash on hand per currency, agents' margin balances, unconfirmed transactions, in-transit shipments, revenue this month, top customers, per-shipment margin
- **Ops** — packages at each warehouse, containers in transit, deliveries today
- **Agent (own view)** — my POs by stage, my float balance, margin I owe, my payment history
- **Customer portal** — my packages, invoices, tracking; shows shipping mark + overseas warehouse addresses

## Route Map

```text
/                              Public landing + track-by-code
/track/$code                   Public tracking (safe columns only)
/auth · /reset-password
/portal                        Customer portal
/_authenticated/
  /dashboard
  /crm/(contacts|leads|quotes)
  /sourcing/(requests|pos|suppliers)
  /treasury/(accounts|transactions|fx|agent-margins)
  /packages · /shipments · /deliveries
  /invoices
  /reports
  /admin/(users|rate-cards|warehouses|fx-rates)
```

## Phased Build

**Phase 1 — Foundation**
Cloud on · schema for profiles/roles/warehouses/fx_rates + shipping-mark trigger · auth (email + Google) · brand system + logo + favicon · public landing · `/track/$code` · staff & portal shells

**Phase 2 — Packages & Shipments**
Package intake (photos, weight, dims → CBM), status timeline, shipments/containers, portal "My Packages", public track wired

**Phase 3 — Sourcing & Treasury (the new core)**
Suppliers · sourcing requests · POs with margin · accounts · transactions ledger · agent_margin_ledger · proof uploads · admin confirm workflow · FX rates admin · agent dashboard

**Phase 4 — Rate cards, Quotes, Invoices**
Multi-currency rate cards · auto-cost from package dims · invoices with FX snapshot · manual payment recording

**Phase 5 — Dispatch, POD, CRM, Reports**
Driver run sheet · mobile POD (signature + photo) · CRM pipeline · reports (revenue, margins, agent balances, on-time %, per-shipment true cost)

**Phase 6 (optional)** — Paystack online payments · SMS/email status notifications · pre-alert workflow

## Guardrails

- RLS + explicit GRANTs on every public-schema table
- `sourcing_agent` sees only own POs, transactions, margin balance — never other agents' or company treasury
- Customers see only own rows (`customer_id = auth.uid()`)
- All money math server-side (`createServerFn`); client never submits totals
- Every transaction stores currency + FX snapshot at time of entry — historical reports never re-compute
- Proof uploads required for supplier payments and margin settlements before status can go `confirmed`
- Public track endpoint uses server publishable client + narrow `TO anon` policy — tracking_no + status + timeline only, no PII/prices
- Shipping mark generated by DB trigger, never client-supplied
- Roles in separate table (no privilege escalation via profile update)

Approve and I'll ship Phase 1 in the next build.
