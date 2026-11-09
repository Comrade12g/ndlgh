// Parses a China/Accra cargo list (pasted or from a spreadsheet) into rows.
export type ManifestRow = {
  mark: string;
  tracking: string;
  description: string;
  pieces: number | null;
  weight_kg: number | null;
  cbm: number | null;
};

const ALIASES: Record<keyof ManifestRow, string[]> = {
  mark: ["mark", "shipping mark", "唛头", "customer", "code", "client"],
  tracking: ["tracking", "courier", "express", "waybill", "快递单号", "单号", "tracking no"],
  description: ["description", "goods", "item", "品名", "product"],
  pieces: ["pieces", "pcs", "ctns", "cartons", "qty", "件数", "箱数"],
  weight_kg: ["weight", "kg", "gw", "重量"],
  cbm: ["cbm", "volume", "体积", "方数"],
};

function matchHeader(h: string): keyof ManifestRow | null {
  const s = h.trim().toLowerCase();
  if (!s) return null;
  for (const [k, list] of Object.entries(ALIASES) as [keyof ManifestRow, string[]][]) {
    if (list.some((a) => s === a || s.includes(a))) return k;
  }
  return null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(String(v).replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function rowsFromGrid(grid: unknown[][]): ManifestRow[] {
  const cleaned = grid.filter((r) => r.some((c) => String(c ?? "").trim() !== ""));
  if (!cleaned.length) return [];
  const header = cleaned[0].map((c) => matchHeader(String(c ?? "")));
  const hasHeader = header.filter(Boolean).length >= 2;
  const cols: (keyof ManifestRow | null)[] = hasHeader
    ? header
    : ["mark", "tracking", "description", "pieces", "weight_kg", "cbm"];
  const body = hasHeader ? cleaned.slice(1) : cleaned;
  return body
    .map((r) => {
      const out: ManifestRow = { mark: "", tracking: "", description: "", pieces: null, weight_kg: null, cbm: null };
      cols.forEach((k, i) => {
        if (!k) return;
        const v = r[i];
        if (k === "pieces" || k === "weight_kg" || k === "cbm") out[k] = num(v);
        else out[k] = String(v ?? "").trim();
      });
      out.mark = out.mark.toUpperCase();
      return out;
    })
    .filter((r) => r.mark || r.tracking);
}

export function parsePasted(text: string): ManifestRow[] {
  const grid = text
    .split(/\r?\n/)
    .map((l) => (l.includes("\t") ? l.split("\t") : l.split(/\s*,\s*/)));
  return rowsFromGrid(grid);
}
