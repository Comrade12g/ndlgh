// Parses a China/Accra cargo list (pasted or from a spreadsheet) into rows.
// Supports English lists and the China warehouse format
// (客户名 / Item Name / 快递单号 / 件数 / 毛重总和 / 体积总和).
export type ManifestRow = {
  mark: string;
  tracking: string;
  description: string;
  pieces: number | null;
  weight_kg: number | null;
  cbm: number | null;
};

type Field = keyof ManifestRow;

// Ordered by priority: totals beat per-piece columns, English name beats Chinese.
const ALIASES: Record<Field, string[]> = {
  mark: ["shipping mark", "mark", "唛头", "客户名", "customer", "client", "code"],
  tracking: ["快递单号", "tracking no", "tracking", "courier", "express", "waybill", "单号"],
  description: ["item name", "description", "goods", "品名", "product", "item", "货名"],
  pieces: ["件数", "总件数", "pieces", "pcs", "ctns", "cartons", "qty", "箱数"],
  weight_kg: ["毛重总和", "total weight", "总重", "weight", "gw", "kg", "毛重", "重量"],
  cbm: ["体积总和", "total cbm", "总体积", "cbm", "volume", "方数", "体积"],
};
const FALLBACK_DESC = ["货名", "品名"];

const norm = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();

function findCol(headers: string[], aliases: string[], used: Set<number>): number {
  for (const a of aliases) {
    let i = headers.findIndex((h, idx) => !used.has(idx) && h === a);
    if (i < 0) i = headers.findIndex((h, idx) => !used.has(idx) && h.includes(a));
    if (i >= 0) return i;
  }
  return -1;
}

/** "ND0043/Mary Dugba", "NDL0054", "nd 77" -> "ND0043" / "ND0054" / "ND0077" */
export function normalizeMark(v: unknown): string {
  const s = norm(v).toUpperCase();
  const m = s.match(/N\s*D\s*L?\s*-?\s*(\d{1,5})/);
  if (m) return "ND" + m[1].padStart(4, "0");
  return s;
}

function cleanTracking(v: unknown): string {
  return norm(v).replace(/^[/\s]+|[/\s]+$/g, "").replace(/\s*\/\s*/g, "/");
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(String(v).replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

/** Same mark + same tracking = one parcel; add up cartons, weight and CBM. */
function mergeDuplicates(rows: ManifestRow[]): ManifestRow[] {
  const map = new Map<string, ManifestRow>();
  const out: ManifestRow[] = [];
  for (const r of rows) {
    if (!r.tracking) { out.push(r); continue; }
    const key = `${r.mark}|${r.tracking}`;
    const ex = map.get(key);
    if (!ex) { const c = { ...r }; map.set(key, c); out.push(c); continue; }
    const add = (a: number | null, b: number | null) => (a === null && b === null ? null : (a ?? 0) + (b ?? 0));
    ex.pieces = add(ex.pieces, r.pieces);
    const w = add(ex.weight_kg, r.weight_kg);
    ex.weight_kg = w === null ? null : round(w, 2);
    const c = add(ex.cbm, r.cbm);
    ex.cbm = c === null ? null : round(c, 4);
    if (r.description && !ex.description.split(", ").includes(r.description)) {
      ex.description = ex.description ? `${ex.description}, ${r.description}` : r.description;
    }
  }
  return out;
}

export function rowsFromGrid(grid: unknown[][]): ManifestRow[] {
  const cleaned = grid.filter((r) => Array.isArray(r) && r.some((c) => norm(c) !== ""));
  if (!cleaned.length) return [];
  const headers = cleaned[0].map((c) => norm(c).toLowerCase());
  const used = new Set<number>();
  const cols = {} as Record<Field, number>;
  for (const f of Object.keys(ALIASES) as Field[]) {
    cols[f] = findCol(headers, ALIASES[f], used);
    if (cols[f] >= 0) used.add(cols[f]);
  }
  const descFallback = findCol(headers, FALLBACK_DESC, new Set([cols.description]));
  const hasHeader = Object.values(cols).filter((i) => i >= 0).length >= 2;
  if (!hasHeader) {
    (["mark", "tracking", "description", "pieces", "weight_kg", "cbm"] as Field[]).forEach((f, i) => (cols[f] = i));
  }
  const body = hasHeader ? cleaned.slice(1) : cleaned;
  const at = (r: unknown[], i: number) => (i >= 0 ? r[i] : undefined);
  const rows = body
    .map((r): ManifestRow => {
      let description = norm(at(r, cols.description));
      if (!description && hasHeader) description = norm(at(r, descFallback));
      return {
        mark: normalizeMark(at(r, cols.mark)),
        tracking: cleanTracking(at(r, cols.tracking)),
        description,
        pieces: num(at(r, cols.pieces)),
        weight_kg: num(at(r, cols.weight_kg)),
        cbm: num(at(r, cols.cbm)),
      };
    })
    .filter((r) => r.mark || r.tracking);
  return mergeDuplicates(rows);
}

export function parsePasted(text: string): ManifestRow[] {
  const grid = text
    .split(/\r?\n/)
    .map((l) => (l.includes("\t") ? l.split("\t") : l.split(/\s*,\s*/)));
  return rowsFromGrid(grid);
}
