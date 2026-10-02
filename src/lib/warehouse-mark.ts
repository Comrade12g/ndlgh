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
