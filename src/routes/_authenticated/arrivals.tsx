import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ops/PageHeader";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { notifyCustomer } from "@/lib/notifications";
import { parsePasted, rowsFromGrid, type ManifestRow } from "@/lib/manifest-parse";

export const Route = createFileRoute("/_authenticated/arrivals")({
  head: () => ({ meta: [{ title: "Arrival list — NDL" }] }),
  component: ArrivalsPage,
});

type Status = "received" | "in_transit" | "arrived_gh" | "ready_delivery";
const STATUS_LABEL: Record<Status, string> = {
  received: "Arrived at China warehouse",
  in_transit: "In transit (left China)",
  arrived_gh: "Arrived in Ghana",
  ready_delivery: "Ready for pickup",
};

type Result = { row_no: number; result: string; tracking_code: string; customer_id: string | null; full_name: string | null; phone: string | null; shipping_mark: string | null; package_id: string };

function ArrivalsPage() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ManifestRow[]>([]);
  const [status, setStatus] = useState<Status>("arrived_gh");
  const [sms, setSms] = useState(true);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);

  const [wb, setWb] = useState<XLSX.WorkBook | null>(null);
  const [sheet, setSheet] = useState("");

  function readSheet(book: XLSX.WorkBook, name: string) {
    const grid = XLSX.utils.sheet_to_json<unknown[]>(book.Sheets[name], { header: 1, defval: "" });
    const r = rowsFromGrid(grid);
    setSheet(name);
    setRows(r);
    setResults(null);
    toast.success(`${r.length} parcels read from sheet "${name}"`);
  }

  async function onFile(f: File) {
    const book = XLSX.read(await f.arrayBuffer());
    setWb(book);
    readSheet(book, book.SheetNames[0]);
  }

  async function apply() {
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("import_arrival_manifest", { _rows: rows as never, _status: status });
      if (error) throw error;
      const res = (data ?? []) as Result[];
      setResults(res);
      if (sms) {
        const byCustomer = new Map<string, Result[]>();
        res.forEach((r) => r.customer_id && byCustomer.set(r.customer_id, [...(byCustomer.get(r.customer_id) ?? []), r]));
        for (const list of byCustomer.values()) {
          const c = list[0];
          await notifyCustomer({
            customerId: c.customer_id,
            phone: c.phone,
            event: status === "in_transit" ? "shipment_departed" : status === "received" ? "package_received" : "shipment_arrived",
            packageId: c.package_id,
            message: `Hi ${c.full_name ?? "there"}, ${list.length} of your parcel(s) (${list.map((l) => l.tracking_code).join(", ")}) are now: ${STATUS_LABEL[status]}. Check your customer portal: https://www.ndlgh.com/portal\nNDL Cargo`,
          });
        }
      }
      toast.success(`${res.length} parcels updated on the customer portal. No invoices were changed.`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Accra team"
        title="Arrival list"
        description="Upload or paste the list from China. Parcels update on each customer's portal. Invoices are not calculated — enter them manually."
      />
      <Card className="mb-4 space-y-3 p-4">
        <div>
          <Label htmlFor="file">Excel / CSV file</Label>
          <input id="file" type="file" accept=".xlsx,.xls,.csv" className="mt-1 block text-sm" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          {wb && wb.SheetNames.length > 1 && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sheet:</span>
              {wb.SheetNames.map((n) => (
                <Button key={n} size="sm" variant={n === sheet ? "default" : "outline"} onClick={() => readSheet(wb, n)}>
                  {n}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="paste">…or paste the list (columns: Mark, Tracking, Goods, Ctns, KG, CBM)</Label>
          <Textarea id="paste" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
          <Button variant="outline" className="mt-2" onClick={() => { setRows(parsePasted(text)); setResults(null); }}>Read list</Button>
        </div>
      </Card>

      {rows.length > 0 && (
        <Card className="space-y-3 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label>New status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as Status[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={sms} onCheckedChange={(v) => setSms(v === true)} /> Send SMS to customers
            </label>
            <Button disabled={busy || !!results} onClick={apply} className="bg-brand-orange hover:bg-brand-orange/90">
              {busy ? "Updating…" : `Update ${rows.length} parcels`}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr><th className="p-2">#</th><th className="p-2">Mark</th><th className="p-2">Tracking</th><th className="p-2">Goods</th><th className="p-2">Ctns</th><th className="p-2">KG</th><th className="p-2">CBM</th><th className="p-2">Result</th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const res = results?.find((x) => x.row_no === i + 1);
                  return (
                    <tr key={i} className="border-t">
                      <td className="p-2">{i + 1}</td><td className="p-2 font-mono">{r.mark}</td><td className="p-2 font-mono">{r.tracking}</td>
                      <td className="p-2">{r.description}</td><td className="p-2">{r.pieces ?? "—"}</td><td className="p-2">{r.weight_kg ?? "—"}</td><td className="p-2">{r.cbm ?? "—"}</td>
                      <td className="p-2">{res ? `${res.result} ${res.tracking_code}${res.customer_id ? ` · ${res.full_name ?? ""}` : " · no customer for mark"}` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
