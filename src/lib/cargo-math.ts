// Shared cargo calculations for the counter and intake stations.

/** CBM from centimetre dimensions, rounded to 3 decimals. Returns 0 for bad input. */
export function cbmFromCm(l: number, w: number, h: number, pieces = 1): number {
  if (![l, w, h, pieces].every((n) => Number.isFinite(n) && n > 0)) return 0;
  return Math.round(((l * w * h) / 1_000_000) * pieces * 1000) / 1000;
}

/** Parse "50*40*30", "50x40x30" or "50 40 30" into [l, w, h]. */
export function parseDims(input: string): [number, number, number] | null {
  const parts = input.trim().split(/[\s*xX×,]+/).filter(Boolean).map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  return [parts[0], parts[1], parts[2]];
}

/** Statuses meaning the parcel is physically at the Ghana warehouse, ready for pickup. */
export const AT_GHANA = ["arrived_gh", "ready_delivery"] as const;
export const IN_TRANSIT = ["loaded", "in_transit"] as const;
export const AT_CHINA = ["expected", "received", "weighed"] as const;

export function outstanding(total: number, paid: number): number {
  return Math.max(0, Math.round((Number(total) - Number(paid)) * 100) / 100);
}
