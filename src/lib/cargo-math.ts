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

/** Sum recorded package volumes once, using the same stages as the counter. */
export function cargoVolumeTotals(rows: readonly { cbm: number | string | null; status: string }[]) {
  const totals = { all: 0, china: 0, shipped: 0, accra: 0, collected: 0 };
  for (const row of rows) {
    const volume = Number(row.cbm);
    if (!Number.isFinite(volume) || volume <= 0) continue;
    totals.all += volume;
    if ((AT_CHINA as readonly string[]).includes(row.status)) totals.china += volume;
    else if ((IN_TRANSIT as readonly string[]).includes(row.status)) totals.shipped += volume;
    else if ((AT_GHANA as readonly string[]).includes(row.status)) totals.accra += volume;
    else if (row.status === "delivered") totals.collected += volume;
  }
  return totals;
}

export function outstanding(total: number, paid: number): number {
  return Math.max(0, Math.round((Number(total) - Number(paid)) * 100) / 100);
}
