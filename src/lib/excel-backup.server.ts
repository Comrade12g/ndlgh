import * as XLSX from "xlsx";

// Every business table, one sheet each.
export const BACKUP_TABLES = [
  "profiles", "contacts", "user_roles",
  "packages", "shipments", "shipment_packages", "deliveries", "delivery_packages",
  "invoices", "invoice_items", "payments", "transactions", "fx_rates", "agent_margin_ledger",
  "purchase_orders", "sourcing_requests", "suppliers", "service_requests",
  "rates", "warehouses", "leads", "customer_notifications",
] as const;

const ONEDRIVE_PATH = "/me/drive/root:/NDL Backups/NDL-CRM-Backup.xlsx:/content";

export async function buildBackupWorkbook(): Promise<{ bytes: Uint8Array; rows: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const wb = XLSX.utils.book_new();
  let rows = 0;
  for (const table of BACKUP_TABLES) {
    const all: Record<string, unknown>[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select("*")
        .range(from, from + 999);
      if (error) throw new Error(`${table}: ${error.message}`);
      all.push(...((data ?? []) as Record<string, unknown>[]));
      if (!data || data.length < 1000) break;
    }
    const flat = all.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, v !== null && typeof v === "object" ? JSON.stringify(v) : v]),
      ),
    );
    rows += flat.length;
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flat), table.slice(0, 31));
  }
  const meta = XLSX.utils.aoa_to_sheet([["Backup generated at (UTC)", new Date().toISOString()], ["Total rows", rows]]);
  XLSX.utils.book_append_sheet(wb, meta, "_info");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return { bytes: new Uint8Array(out), rows };
}

export async function uploadBackupToOneDrive(bytes: Uint8Array) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["MICROSOFT_EXCEL_API_KEY"];
  if (!lovableKey || !connKey) throw new Error("Microsoft Excel connection is not configured");
  const res = await fetch(`https://connector-gateway.lovable.dev/microsoft_excel${encodeURI(ONEDRIVE_PATH)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connKey,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    body: bytes,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OneDrive upload failed [${res.status}]: ${body.slice(0, 500)}`);
  }
}

export async function runExcelSync() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  try {
    const { bytes, rows } = await buildBackupWorkbook();
    await uploadBackupToOneDrive(bytes);
    await supabaseAdmin.from("excel_sync_log").insert({ status: "success", rows_synced: rows });
    return { ok: true as const, rows };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[excel-sync]", msg);
    await supabaseAdmin.from("excel_sync_log").insert({ status: "error", error: msg.slice(0, 1000) });
    return { ok: false as const, error: msg };
  }
}
