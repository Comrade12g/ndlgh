import { supabase } from "@/integrations/supabase/client";
import { outstanding } from "@/lib/cargo-math";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const STATUS: Record<string, string> = {
  received: "Received in China", in_warehouse: "In China warehouse", in_transit: "In transit",
  arrived_gh: "Arrived Accra", ready_delivery: "Ready in Accra", delivered: "Released",
};

/** Opens a printable A4 statement of all a customer's goods and open balances. Staff only (RLS). */
export async function printCustomerStatement(customerId: string) {
  const w = window.open("", "_blank", "width=900,height=900");
  if (!w) return;
  w.document.write("<p style='font-family:sans-serif'>Preparing statement…</p>");
  const [p, pk, inv] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, shipping_mark").eq("id", customerId).single(),
    supabase.from("packages")
      .select("tracking_code, external_tracking, description, pieces, weight_kg, cbm, status, received_at, warehouse_code")
      .eq("customer_id", customerId).order("received_at", { ascending: false }).limit(1000),
    supabase.from("invoices").select("number, currency, total, amount_paid, status, issue_date")
      .eq("customer_id", customerId).not("status", "in", "(void,draft)").order("issue_date"),
  ]);
  const pf = p.data; const rows = pk.data ?? []; const invs = inv.data ?? [];
  const sum = (k: "pieces" | "weight_kg" | "cbm") => rows.reduce((s, r) => s + Number(r[k] ?? 0), 0);
  const bal: Record<string, { billed: number; paid: number }> = {};
  for (const i of invs) {
    const b = (bal[i.currency] ??= { billed: 0, paid: 0 });
    b.billed += Number(i.total); b.paid += Number(i.amount_paid);
  }
  const open = invs.filter((i) => outstanding(i.total, i.amount_paid) > 0);
  w.document.open();
  w.document.write(`<html><head><title>Statement ${esc(pf?.shipping_mark)}</title><style>
  @page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#0A2E5C;font-size:12px}
  h1{margin:0;font-size:22px}.bar{border-bottom:4px solid #F58220;padding-bottom:8px;display:flex;justify-content:space-between}
  table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#0A2E5C;color:#fff;text-align:left;padding:5px;font-size:11px}
  td{border-bottom:1px solid #ddd;padding:4px;font-size:11px}.tot{display:flex;gap:24px;margin:12px 0;font-size:13px}
  .tot b{display:block;font-size:18px;color:#F58220}h2{font-size:14px;margin:18px 0 0}
  .sig{margin-top:40px;display:flex;justify-content:space-between}</style></head><body>
  <div class="bar"><div><h1>NDL Cargo — Customer Statement</h1>Next Day Logistics · ndlgh.com · WhatsApp 0500229352</div>
  <div style="text-align:right">${esc(new Date().toLocaleString())}</div></div>
  <p style="font-size:15px"><b>${esc(pf?.shipping_mark)}</b> · ${esc(pf?.full_name)} · ${esc(pf?.phone)}</p>
  <div class="tot"><div>Parcels<b>${rows.length}</b></div><div>Pieces<b>${sum("pieces")}</b></div>
  <div>CBM<b>${sum("cbm").toFixed(3)}</b></div><div>Weight (kg)<b>${sum("weight_kg").toFixed(2)}</b></div></div>
  <h2>All goods received</h2><table><tr><th>Date</th><th>NDL ref</th><th>Supplier tracking</th><th>Goods</th><th>Pcs</th><th>CBM</th><th>Kg</th><th>WH</th><th>Status</th></tr>
  ${rows.map((r) => `<tr><td>${r.received_at ? esc(new Date(r.received_at).toLocaleDateString()) : ""}</td><td>${esc(r.tracking_code)}</td><td>${esc(r.external_tracking)}</td><td>${esc(r.description)}</td><td>${esc(r.pieces)}</td><td>${Number(r.cbm ?? 0).toFixed(3)}</td><td>${esc(r.weight_kg)}</td><td>${esc(r.warehouse_code)}</td><td>${esc(STATUS[r.status] ?? r.status)}</td></tr>`).join("") || "<tr><td colspan=9>No goods recorded</td></tr>"}
  </table>
  <h2>Account balance</h2><table><tr><th>Currency</th><th>Billed</th><th>Paid</th><th>Balance</th></tr>
  ${Object.entries(bal).map(([c, b]) => `<tr><td>${c}</td><td>${b.billed.toFixed(2)}</td><td>${b.paid.toFixed(2)}</td><td><b>${(b.billed - b.paid).toFixed(2)}</b></td></tr>`).join("") || "<tr><td colspan=4>No invoices</td></tr>"}
  </table>
  ${open.length ? `<h2>Open invoices</h2><table><tr><th>Invoice</th><th>Date</th><th>Due</th></tr>${open.map((i) => `<tr><td>${esc(i.number)}</td><td>${esc(i.issue_date)}</td><td>${i.currency} ${outstanding(i.total, i.amount_paid).toFixed(2)}</td></tr>`).join("")}</table>` : ""}
  <div class="sig"><span>Issued by: ____________</span><span>Customer sign: ____________</span><span>Stamp</span></div>
  <script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}
