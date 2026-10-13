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
  if (!last3) return null;
  const suffix = shippingMark!.toUpperCase();
  void markPrefix;
  return suffix;
}

export type WarehouseForSupplier = {
  code?: string | null;
  name: string;
  name_local?: string | null;
  mark_prefix?: string | null;
  address?: string | null;
  address_local?: string | null;
  receiving_hours?: string | null;
  phones?: string | null;
};

/** Air cargo mark in the exact template the client gave: 【WP-ND0016】 */
export function airMark(shippingMark: string | null | undefined): string {
  const mark = customerMark("WP", shippingMark);
  return mark ? `【WP-${mark}】` : "【WP-ND####】";
}

/** Multi-line text a customer can paste to their supplier. */
export function buildSupplierText(
  w: WarehouseForSupplier,
  shippingMark: string | null | undefined,
  clientName?: string | null,
): string {
  const isAir = w.code === "WP" || w.mark_prefix === "WP";
  if (isAir) {
    // Exact one-line format, unchanged:
    // 【WP-ND0016】CLIENT NAME 13428888064 广东省广州市越秀区广园西路94号迦南地国际采购中心1楼1037铺
    return [airMark(shippingMark), clientName?.trim() || "CLIENT NAME", w.phones, w.address_local ?? w.address]
      .filter(Boolean)
      .join(" ");
  }
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
