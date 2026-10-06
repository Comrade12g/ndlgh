/**
 * Builds the warehouse intake mark a customer gives their supplier, e.g.
 * prefix "GHO0007" + shipping mark "ND0005" -> "GHO0007 — ND0005".
 * The masked "***" in the warehouse template is replaced by the last three
 * digits of the customer's shipping mark / account id.
 */
export function lastThreeDigits(shippingMark: string | null | undefined): string | null {
  if (!shippingMark) return null;
  const digits = shippingMark.replace(/\D/g, "");
  if (!digits) return null;
  return digits.slice(-3).padStart(3, "0");
}

export function customerMark(
  markPrefix: string | null | undefined,
  shippingMark: string | null | undefined,
): string | null {
  const last3 = lastThreeDigits(shippingMark);
  if (!last3) return markPrefix ?? null;
  const suffix = shippingMark!.toUpperCase();
  return markPrefix ? `${markPrefix} — ${suffix}` : suffix;
}

export type WarehouseForSupplier = {
  name: string;
  name_local?: string | null;
  mark_prefix?: string | null;
  address?: string | null;
  address_local?: string | null;
  receiving_hours?: string | null;
  phones?: string | null;
};

/** Multi-line text a customer can paste to their supplier. */
export function buildSupplierText(w: WarehouseForSupplier, shippingMark: string | null | undefined): string {
  const mark = customerMark(w.mark_prefix, shippingMark);
  return [
    `${w.name}${w.name_local ? ` (${w.name_local})` : ""}`,
    mark ? `Mark: ${mark}` : null,
    w.address_local ?? w.address,
    w.address_local && w.address ? w.address : null,
    w.receiving_hours ? `Hours: ${w.receiving_hours}` : null,
    w.phones ? `Tel: ${w.phones}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
