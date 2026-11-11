import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { Search, Wallet, PackageCheck, Printer, Ship, Warehouse, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { sanitizePostgrestTerm } from "@/lib/utils";
import { AT_GHANA, IN_TRANSIT, AT_CHINA, outstanding } from "@/lib/cargo-math";
import { openWhatsApp } from "@/lib/whatsapp";
import { PrintStatementMenu } from "@/components/ops/PrintStatementMenu";

export const Route = createFileRoute("/_authenticated/counter")({
  head: () => ({ meta: [{ title: "Front counter | NDL Ops" }, { name: "robots", content: "noindex" }] }),
  component: CounterPage,
});

type Method = "mobile_money" | "cash" | "bank" | "card";

function CounterPage() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [method, setMethod] = useState<Method>("mobile_money");
  const [reference, setReference] = useState("");
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => inputRef.current?.focus(), []);

  const { data: matches } = useQuery({
    queryKey: ["counter-search", query],
    enabled: query.length >= 2,
    queryFn: async () => {
      const t = sanitizePostgrestTerm(query.toUpperCase().startsWith("ND") ? query.toUpperCase() : query);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, shipping_mark")
        .or(`shipping_mark.ilike.%${t}%,phone.ilike.%${t}%,full_name.ilike.%${t}%`)
        .limit(8);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (matches?.length === 1) setCustomerId(matches[0].id);
  }, [matches]);

  const { data: file, isLoading } = useQuery({
    queryKey: ["counter-file", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const id = customerId!;
      const [p, pk, inv] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, shipping_mark").eq("id", id).single(),
        supabase
          .from("packages")
          .select("id, tracking_code, external_tracking, description, pieces, weight_kg, cbm, status, received_at, warehouse_code")
          .eq("customer_id", id)
          .neq("status", "delivered")
          .order("received_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("id, number, currency, total, amount_paid, status, issue_date")
          .eq("customer_id", id)
          .not("status", "in", "(paid,void,draft)")
          .order("issue_date"),
      ]);
      if (p.error) throw p.error;
      return { profile: p.data, packages: pk.data ?? [], invoices: inv.data ?? [] };
    },
  });

  const packages = file?.packages ?? [];
  const atGhana = packages.filter((p) => (AT_GHANA as readonly string[]).includes(p.status));
  const transit = packages.filter((p) => (IN_TRANSIT as readonly string[]).includes(p.status));
  const china = packages.filter((p) => (AT_CHINA as readonly string[]).includes(p.status));
  const invoices = file?.invoices ?? [];
  const balances = invoices.reduce<Record<string, number>>((acc, i) => {
    acc[i.currency] = (acc[i.currency] ?? 0) + outstanding(i.total, i.amount_paid);
    return acc;
  }, {});
  const owes = Object.values(balances).some((v) => v > 0);
  const cbmGh = atGhana.reduce((s, p) => s + Number(p.cbm), 0);

  useEffect(() => {
    setSelected(new Set(atGhana.map((p) => p.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const pay = useMutation({
    mutationFn: async () => {
      let remaining = Number(payAmount);
      if (!remaining || remaining <= 0) throw new Error("Enter amount received");
      const { data: u } = await supabase.auth.getUser();
      // Apply payment to oldest open invoices first.
      for (const inv of invoices) {
        if (remaining <= 0) break;
        const due = outstanding(inv.total, inv.amount_paid);
        if (due <= 0) continue;
        const amt = Math.min(due, remaining);
        remaining -= amt;
        const { error } = await supabase.from("payments").insert({
          invoice_id: inv.id,
          customer_id: customerId,
          amount: amt,
          currency: inv.currency,
          method,
          reference: reference || null,
          received_by: u.user?.id,
        });
        if (error) throw error;
        const paid = Number(inv.amount_paid) + amt;
        await supabase
          .from("invoices")
          .update({ amount_paid: paid, status: paid >= Number(inv.total) ? "paid" : "partial" })
          .eq("id", inv.id);
        await supabase.from("transactions").insert({
          txn_type: "customer_receipt",
          direction: "credit",
          amount: amt,
          currency: inv.currency,
          customer_id: customerId,
          invoice_id: inv.id,
          reference: reference || null,
          created_by: u.user?.id,
        });
      }
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setPayAmount("");
      setReference("");
      qc.invalidateQueries({ queryKey: ["counter-file", customerId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const release = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      if (!ids.length) throw new Error("Tick the parcels being collected");
      const { error } = await supabase.from("packages").update({ status: "delivered" }).in("id", ids);
      if (error) throw error;
      return ids;
    },
    onSuccess: (ids) => {
      printGatePass(ids);
      toast.success(`${ids.length} parcel(s) released`);
      qc.invalidateQueries({ queryKey: ["counter-file", customerId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function printGatePass(ids: string[]) {
    const pf = file?.profile;
    const rows = packages.filter((p) => ids.includes(p.id));
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w || !pf) return;
    const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
    w.document.write(`<html><head><title>Gate pass</title><style>body{font-family:sans-serif;padding:16px}td,th{border-bottom:1px solid #ccc;padding:4px;font-size:12px;text-align:left}table{width:100%;border-collapse:collapse}</style></head><body>
      <h2 style="margin:0">NDL Gate Pass</h2><p>${new Date().toLocaleString()}</p>
      <p><b>${esc(pf.shipping_mark)}</b> · ${esc(pf.full_name)} · ${esc(pf.phone)}</p>
      <table><tr><th>Ref</th><th>Pcs</th><th>CBM</th><th>Kg</th></tr>
      ${rows.map((r) => `<tr><td>${esc(r.tracking_code)}</td><td>${esc(r.pieces)}</td><td>${Number(r.cbm).toFixed(3)}</td><td>${esc(r.weight_kg)}</td></tr>`).join("")}
      </table><p>Balance at release: ${owes ? Object.entries(balances).map(([c, v]) => `${c} ${v.toFixed(2)}`).join(", ") : "Fully paid"}</p>
      <p style="margin-top:40px">Released by: __________ &nbsp; Customer sign: __________</p>
      <script>window.print()</script></body></html>`);
    w.document.close();
  }

  const pf = file?.profile;

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Accra warehouse"
        title="Front counter"
        description="Type or scan a mark (ND0060), phone or name. See everything, take payment and release in one screen."
      />

      <form
        className="relative mb-6 max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          setCustomerId(null);
          setQuery(term.trim());
        }}
      >
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="ND0060, 0244…, or customer name — press Enter"
          className="h-14 pl-12 text-lg"
          aria-label="Find customer"
        />
      </form>

      {!customerId && matches && matches.length > 1 && (
        <Card className="mb-6 max-w-2xl divide-y">
          {matches.map((m) => (
            <button key={m.id} onClick={() => setCustomerId(m.id)} className="flex w-full justify-between p-3 text-left hover:bg-muted">
              <span><b className="text-brand-navy">{m.shipping_mark}</b> · {m.full_name}</span>
              <span className="text-muted-foreground">{m.phone}</span>
            </button>
          ))}
        </Card>
      )}
      {query && matches?.length === 0 && <p className="text-muted-foreground">No customer found for “{query}”.</p>}
      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {pf && (
        <div className="space-y-6">
          <Card className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-brand-orange p-5">
            <div>
              <div className="font-display text-3xl font-extrabold text-brand-navy">{pf.shipping_mark}</div>
              <div className="text-lg">{pf.full_name}</div>
              <div className="text-sm text-muted-foreground">{pf.phone}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <Stat icon={Warehouse} label="Ready in Accra" value={`${atGhana.length}`} sub={`${cbmGh.toFixed(3)} CBM`} />
              <Stat icon={Ship} label="On the way" value={`${transit.length}`} />
              <Stat icon={Wallet} label="Balance" value={owes ? Object.entries(balances).filter(([, v]) => v > 0).map(([c, v]) => `${c} ${v.toFixed(2)}`).join(" / ") : "Paid"} tone={owes ? "warn" : "ok"} />
            </div>
            <PrintStatementMenu customerId={customerId!} />
            {pf.phone && (
              <Button variant="outline" onClick={() => openWhatsApp(pf.phone, `Hello ${pf.full_name ?? ""}, this is NDL front desk.`)}>
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h2 className="mb-3 font-display text-lg font-bold text-brand-navy">Ready for pickup ({atGhana.length})</h2>
              {atGhana.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing in the Accra warehouse for this customer.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr><th className="w-8" /><th>Ref</th><th>Description</th><th>Pcs</th><th>CBM</th><th>Kg</th></tr>
                  </thead>
                  <tbody>
                    {atGhana.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2">
                          <Checkbox
                            checked={selected.has(p.id)}
                            onCheckedChange={(v) => {
                              const s = new Set(selected);
                              if (v) s.add(p.id); else s.delete(p.id);
                              setSelected(s);
                            }}
                            aria-label={`Select ${p.tracking_code}`}
                          />
                        </td>
                        <td className="font-mono">{p.tracking_code}</td>
                        <td>{p.description ?? "—"}</td>
                        <td>{p.pieces}</td>
                        <td>{Number(p.cbm).toFixed(3)}</td>
                        <td>{p.weight_kg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  className="bg-brand-orange hover:bg-brand-orange/90"
                  disabled={!selected.size || release.isPending}
                  onClick={() => {
                    if (owes && !confirm("Customer still has a balance. Release anyway?")) return;
                    release.mutate();
                  }}
                >
                  <PackageCheck className="mr-2 h-4 w-4" /> Release {selected.size} & print gate pass
                </Button>
                {owes && <span className="text-sm font-medium text-destructive">Balance outstanding — collect payment first</span>}
              </div>

              {(transit.length > 0 || china.length > 0) && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Not yet in Accra</h3>
                  <div className="flex flex-wrap gap-2">
                    {[...transit, ...china].map((p) => (
                      <span key={p.id} className="flex items-center gap-2 rounded border px-2 py-1 text-xs">
                        <span className="font-mono">{p.tracking_code}</span>
                        <StatusBadge tone={statusTone(p.status)}>{p.status.replace(/_/g, " ")}</StatusBadge>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 font-display text-lg font-bold text-brand-navy">Take payment</h2>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open invoices.</p>
              ) : (
                <ul className="mb-4 space-y-1 text-sm">
                  {invoices.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>{i.number}</span>
                      <b>{i.currency} {outstanding(i.total, i.amount_paid).toFixed(2)}</b>
                    </li>
                  ))}
                </ul>
              )}
              <div className="space-y-3">
                <Input type="number" inputMode="decimal" placeholder="Amount received" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} aria-label="Amount received" />
                <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
                  <SelectTrigger aria-label="Payment method"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="MoMo / bank reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} aria-label="Reference" />
                <Button className="w-full" disabled={!invoices.length || pay.isPending} onClick={() => pay.mutate()}>
                  <Wallet className="mr-2 h-4 w-4" /> Record payment
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => printGatePass(Array.from(selected))} disabled={!selected.size}>
                  <Printer className="mr-2 h-4 w-4" /> Preview gate pass
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, tone }: { icon: typeof Ship; label: string; value: string; sub?: string; tone?: "ok" | "warn" }) {
  return (
    <div className="min-w-24">
      <Icon className="mx-auto h-5 w-5 text-brand-sky" />
      <div className={`font-display text-xl font-extrabold ${tone === "warn" ? "text-destructive" : "text-brand-navy"}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}{sub ? ` · ${sub}` : ""}</div>
    </div>
  );
}
