# NDL Control Tower — Auto-invoice, WhatsApp triggers, and live ETA tracking

## What we're fixing

1. **Auto-invoice on intake** — make sure every package matched to a customer at intake immediately gets a line on a draft customer invoice, priced from the active rate card.
2. **WhatsApp trigger messages** — automatically generate the correct message when key events happen and give staff a one-tap "Send on WhatsApp" action (click-to-chat). Log every attempt.
3. **Live ETA tracking** — replace the mock ETA poll with a real carrier/container tracking integration that updates shipment ETAs and milestones automatically.

## Your answers

- **WhatsApp**: keep click-to-chat (no API provider).
- **Carriers to track**: PIL, Maersk, MSC, COSCO.
- **Events that trigger a WhatsApp message**: package received, shipment milestone updates, invoice issued, delivery updates.
- **Backfill existing invoices**: yes, create missing draft invoices for packages already matched to a customer.

## Phase 1: Harden auto-invoicing

- Inspect and repair the `fn_autoinvoice_package` / `trg_package_autoinvoice` flow and the `price_package_line` rate lookup. Fix any remaining edge cases (missing rate, wrong warehouse match, ambiguous column references, etc.).
- Make sure the package-edit dialog correctly triggers a new invoice line when a customer is assigned later, and re-prices the line when weight/dimensions change while the invoice is still `draft`.
- Run a backfill that calls `fn_autoinvoice_package_manual` for every package that has a `customer_id` but no `invoice_items` row.
- Remove the stale `ensureContactShadow` workaround if the schema now correctly links `packages.customer_id` and `invoices.customer_id` to `profiles`.
- Add a clear error path in the intake UI so any trigger failure is shown to the staff member instead of failing silently.

## Phase 2: WhatsApp trigger messages (click-to-chat)

- Create a `customer_notifications` table to log every generated message: event_type, related package/shipment/invoice/delivery id, customer_id, channel, message, status (`pending` / `clicked` / `failed`), triggered_by, created_at.
- **Package intake**: when the intake mutation succeeds and the package was matched to a customer, build the `packageReceived` message and show a toast with a "Send on WhatsApp" button that opens the wa.me link. Log the message as `pending`.
- **Shipment milestones**: when a shipment's milestone advances (departed, arrived, cleared, delivered), build the corresponding milestone message and surface a send action.
- **Invoice issued**: when a customer invoice is sent, build the `invoiceIssued` message and show the send action.
- **Delivery updates**: when a delivery is out for delivery or completed, build the matching message and show the send action.
- **Cron-driven events**: for updates that happen automatically (e.g., ETA milestone changes), create a pending notification row and surface it in a "Pending customer notifications" list for customer-service staff.
- Update the log entry to `clicked` when the staff opens the wa.me link (best-effort via the click handler).

## Phase 3: Live ETA tracking

- Build a carrier-agnostic `VoyageTracker` module under `src/lib/`. Default to a single aggregator that supports PIL, Maersk, MSC, and COSCO (e.g., Terminal49 or ShipsGo); keep the abstraction so the provider can be swapped later.
- Store the aggregator API key as a project secret.
- Rewrite `src/routes/api/public/hooks/poll-shipment-eta.ts` to:
  - Fetch active shipments that have a carrier and container number.
  - Call the tracker API for each.
  - Parse the returned ETA and milestone.
  - Update `shipments.eta`, `shipments.current_milestone`, and `shipments.last_checked_at`.
  - Trigger a WhatsApp notification when the ETA changes or a milestone advances.
- Add a `pg_cron` job to call the poll endpoint every 6 hours (configurable).
- Keep a safe mock/no-key mode so the board does not break while the API key is being set up.

## Phase 4: End-to-end validation

- Test intake → invoice creation in preview.
- Test WhatsApp message generation on each event.
- Test the ETA poll in mock mode and, once the API key is provided, with a real container.
- Run a fresh security scan and publish.

## Technical details

- All database changes (triggers, functions, new `customer_notifications` table) go through `supabase--migration`.
- Data backfill for missing invoices goes through `supabase--insert`.
- Code changes touch: `packages.tsx`, `shipments.tsx`, `invoices.tsx`, `deliveries.tsx`, `whatsapp.ts`, and `src/routes/api/public/hooks/poll-shipment-eta.ts`, plus new `VoyageTracker` files.
- External credential needed: one container-tracking API key for the chosen aggregator. This will be requested after the plan is approved.
- Because you chose click-to-chat, the app cannot literally send WhatsApp messages on its own; it prepares the message and opens WhatsApp with the text pre-filled so the staff member only taps Send.