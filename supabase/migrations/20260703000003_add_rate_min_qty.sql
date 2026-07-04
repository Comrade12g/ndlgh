-- Support a minimum billable quantity per rate (e.g. "1 CBM minimum" on LCL/air
-- rates, common in freight forwarding — a 0.3 CBM shipment still gets billed as
-- if it were 1 CBM). NULL/0 means no minimum is enforced (typical for FCL
-- container rates, which are already a flat per-container price).

ALTER TABLE public.rates ADD COLUMN IF NOT EXISTS min_qty numeric(10, 3);

COMMENT ON COLUMN public.rates.min_qty IS
  'Minimum billable quantity for per-unit rates (e.g. 1 CBM minimum on LCL/air). NULL = no minimum.';
