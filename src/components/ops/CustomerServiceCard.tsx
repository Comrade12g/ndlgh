import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { PendingNotifications, eventLabel } from "@/components/ops/PendingNotifications";
import { buildSupplierText, customerMark } from "@/lib/warehouse-mark";
import { notifyCustomer } from "@/lib/notifications";
import { copyToClipboard } from "@/lib/whatsapp";
import { toast } from "sonner";
import { ArrowLeft, Copy, MessageCircle, Phone, Package, Receipt, Ship, Truck, MapPin, History } from "lucide-react";

export type CsCustomer = { id: string; full_name: string | null; phone: string | null; shipping_mark: string };

const SIGNOFF = "— NDL Global Shipping";

export function CustomerServiceCard({ c, onBack }: { c: CsCustomer; onBack: () => void }) {
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const name = c.full_name ?? "there";

  const { data } = useQuery({
    queryKey: ["cs-360", c.id],
    queryFn: async () => {
      const [p, i, d, n, w] = await Promise.all([
        supabase
          .from("packages")
          .select("id, tracking_code, external_tracking, description, status, pieces, weight_kg, cbm, received_at, warehouse_code")
          .eq("customer_id", c.id)
          .order("received_at", { ascending: false })
          .limit(100),
        supabase
          .from("invoices")
          .select("id, number, total, amount_paid, currency, status, due_date, issue_date")
          .eq("customer_id", c.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("deliveries")
          .select("id, code, city, status, scheduled_for, delivered_at")
          .eq("customer_id", c.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("customer_notifications")
          .select("id, event_type, status, message, created_at")
          .eq("customer_id", c.id)
          .neq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("warehouses")
          .select("code, name, name_local, city, country, mark_prefix, address, address_local, receiving_hours, phones, sort_order")
          .order("sort_order"),
      ]);
      const pkgs = p.data ?? [];
      let shipments: Array<{ id: string; code: string; ndl_reference: string | null; status: string; eta: string | null; mode: string; container_no: string | null }> = [];
      if (pkgs.length) {
        const { data: links } = await supabase
          .from("shipment_packages")
          .select("shipment_id")
          .in("package_id", pkgs.map((x) => x.id));
        const ids = Array.from(new Set((links ?? []).map((l) => l.shipment_id)));
        if (ids.length) {
          const { data: s } = await supabase
            .from("shipments")
            .select("id, code, ndl_reference, status, eta, mode, container_no")
            .in("id", ids)
            .order("created_at", { ascending: false });
          shipments = s ?? [];
        }
      }
      return {
        packages: pkgs,
        invoices: i.data ?? [],
        deliveries: d.data ?? [],
        history: n.data ?? [],
        warehouses: (w.data ?? []).filter((x) => x.code !== "GH" && x.mark_prefix && (x.address || x.address_local)),
        shipments,
      };
    },
  });

  const openInvoices = (data?.invoices ?? []).filter((x) => x.status !== "void" && x.status !== "paid");
  const balanceByCur = openInvoices.reduce<Record<string, number>>((acc, x) => {
    acc[x.currency] = (acc[x.currency] ?? 0) + Number(x.total) - Number(x.amount_paid);
    return acc;
  }, {});
  const balanceText =
    Object.entries(balanceByCur)
      .filter(([, v]) => v > 0.005)
      .map(([cur, v]) => `${cur} ${v.toFixed(2)}`)
      .join(" + ") || "0.00";
  const inChina = (data?.packages ?? []).filter((p) => ["expected", "received", "weighed", "loaded"].includes(p.status)).length;
  const atSea = (data?.packages ?? []).filter((p) => p.status === "in_transit").length;
  const inGhana = (data?.packages ?? []).filter((p) => ["arrived_gh", "ready_delivery"].includes(p.status)).length;

  async function copy(text: string) {
    if (await copyToClipboard(text)) toast.success("Copied");
    else toast.error("Couldn't copy");
  }

  const statusSummary = () => {
    const lines = [`Hi ${name}, here's your NDL update (${c.shipping_mark}):`];
    lines.push(`• In China warehouse: ${inChina}`, `• On the way: ${atSea}`, `• Arrived in Ghana: ${inGhana}`);
    for (const s of (data?.shipments ?? []).slice(0, 3)) {
      lines.push(`• Shipment ${s.ndl_reference ?? s.code}: ${s.status.replace(/_/g, " ")}${s.eta ? `, ETA ${s.eta}` : ""}`);
    }
    if (balanceText !== "0.00") lines.push(`Balance due: ${balanceText}`);
    lines.push(SIGNOFF);
    return lines.join("\n");
  };

  const templates: Array<{ label: string; text: () => string }> = [
    { label: "Status summary", text: statusSummary },
    {
      label: "Payment reminder",
      text: () => `Hi ${name}, a friendly reminder that your balance with NDL is ${balanceText}. Reply here for payment details (MoMo/bank).\n${SIGNOFF}`,
    },
    {
      label: "Warehouse address",
      text: () =>
        `Hi ${name}, here is our China warehouse address. Please give it to your supplier with your mark:\n\n${(data?.warehouses ?? [])
          .map((w) => buildSupplierText(w, c.shipping_mark))
          .join("\n\n")}\n${SIGNOFF}`,
    },
    { label: "Ready for pickup", text: () => `Hi ${name}, your goods are ready for pickup/delivery in Accra. Reply here to arrange.\n${SIGNOFF}` },
  ];

  async function sendMsg() {
    if (!msg.trim()) return;
    await notifyCustomer({ customerId: c.id, phone: c.phone, event: "custom_message", message: msg.trim() });
    setMsg("");
    qc.invalidateQueries({ queryKey: ["cs-360", c.id] });
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to search
      </Button>

      <Card className="border-0 bg-gradient-to-br from-brand-navy to-brand-sky p-5 text-primary-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="font-mono text-2xl font-extrabold">{c.shipping_mark}</div>
            <div className="text-lg font-semibold">{c.full_name ?? "—"}</div>
            <div className="text-sm opacity-80">{c.phone ?? "No phone on file"}</div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => copy(c.shipping_mark)}>
              <Copy className="mr-1 h-4 w-4" /> Copy ID
            </Button>
            {c.phone && (
              <>
                <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90" asChild>
                  <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <a href={`tel:${c.phone}`}>
                    <Phone className="mr-1 h-4 w-4" /> Call
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="In China" value={inChina} />
          <Stat label="On the way" value={atSea} />
          <Stat label="In Ghana" value={inGhana} />
          <Stat label="Shipments" value={data?.shipments.length ?? "…"} />
          <Stat label="Balance owed" value={balanceText} />
        </div>
      </Card>

      <PendingNotifications customerId={c.id} />

      <Card className="p-4">
        <SectionTitle icon={MessageCircle} title="Send a message" />
        <div className="mb-3 flex flex-wrap gap-2">
          {templates.map((t) => (
            <Button key={t.label} size="sm" variant="outline" onClick={() => setMsg(t.text())}>
              {t.label}
            </Button>
          ))}
        </div>
        <Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Pick a template or type your reply…" />
        <div className="mt-3 flex gap-2">
          <Button onClick={sendMsg} disabled={!msg.trim() || !c.phone} className="bg-brand-orange hover:bg-brand-orange/90">
            <MessageCircle className="mr-1 h-4 w-4" /> Open in WhatsApp
          </Button>
          <Button variant="outline" onClick={() => copy(msg)} disabled={!msg.trim()}>
            <Copy className="mr-1 h-4 w-4" /> Copy
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle icon={Package} title={`Packages (${data?.packages.length ?? 0})`} />
          <List empty="No packages yet.">
            {(data?.packages ?? []).map((p) => (
              <li key={p.id} className="py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-brand-navy">{p.tracking_code}</span>
                  <StatusBadge tone={statusTone(p.status)}>{p.status.replace(/_/g, " ")}</StatusBadge>
                </div>
                <div className="text-sm">{p.description ?? "—"}</div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {p.external_tracking && <span>Courier: {p.external_tracking}</span>}
                  <span>{p.pieces} pcs</span>
                  <span>{Number(p.weight_kg).toFixed(1)} kg</span>
                  <span>{Number(p.cbm).toFixed(3)} CBM</span>
                  {p.warehouse_code && <span>{p.warehouse_code}</span>}
                  {p.received_at && <span>Received {p.received_at.slice(0, 10)}</span>}
                </div>
              </li>
            ))}
          </List>
        </Card>

        <Card className="p-4">
          <SectionTitle icon={Ship} title="Shipments" />
          <List empty="Not on any shipment yet.">
            {(data?.shipments ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <div className="font-mono text-sm font-bold text-brand-navy">{s.ndl_reference ?? s.code}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.mode.replace(/_/g, " ").toUpperCase()}
                    {s.container_no ? ` · ${s.container_no}` : ""}
                    {s.eta ? ` · ETA ${s.eta}` : ""}
                  </div>
                </div>
                <StatusBadge tone={statusTone(s.status)}>{s.status.replace(/_/g, " ")}</StatusBadge>
              </li>
            ))}
          </List>
        </Card>

        <Card className="p-4">
          <SectionTitle icon={Receipt} title="Invoices" />
          <List empty="No invoices yet.">
            {(data?.invoices ?? []).map((i) => {
              const due = Number(i.total) - Number(i.amount_paid);
              return (
                <li key={i.id} className="flex items-center justify-between gap-2 py-2">
                  <div>
                    <div className="font-mono text-sm font-bold text-brand-navy">{i.number}</div>
                    <div className="text-xs text-muted-foreground">
                      {i.currency} {Number(i.total).toFixed(2)} · paid {Number(i.amount_paid).toFixed(2)}
                      {due > 0.005 && i.status !== "void" ? ` · owes ${due.toFixed(2)}` : ""}
                    </div>
                  </div>
                  <StatusBadge tone={statusTone(i.status)}>{i.status}</StatusBadge>
                </li>
              );
            })}
          </List>
        </Card>

        <Card className="p-4">
          <SectionTitle icon={Truck} title="Deliveries" />
          <List empty="No deliveries yet.">
            {(data?.deliveries ?? []).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <div className="font-mono text-sm font-bold text-brand-navy">{d.code}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.city}
                    {d.scheduled_for ? ` · ${d.scheduled_for}` : ""}
                  </div>
                </div>
                <StatusBadge tone={statusTone(d.status)}>{d.status.replace(/_/g, " ")}</StatusBadge>
              </li>
            ))}
          </List>
        </Card>

        <Card className="p-4">
          <SectionTitle icon={MapPin} title="Warehouse address for supplier" />
          <div className="space-y-3">
            {(data?.warehouses ?? []).map((w) => (
              <div key={w.code} className="rounded-lg border border-dashed border-brand-orange/40 bg-brand-orange/5 p-3">
                <div className="font-semibold text-brand-navy">{w.name}</div>
                <div className="font-mono text-sm font-bold text-brand-orange">{customerMark(w.mark_prefix, c.shipping_mark)}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(customerMark(w.mark_prefix, c.shipping_mark) ?? "")}>
                    <Copy className="mr-1 h-4 w-4" /> Copy mark
                  </Button>
                  <Button size="sm" className="bg-brand-navy hover:bg-brand-navy/90" onClick={() => copy(buildSupplierText(w, c.shipping_mark))}>
                    <Copy className="mr-1 h-4 w-4" /> Copy for supplier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle icon={History} title="Messages sent" />
          <List empty="No messages sent yet.">
            {(data?.history ?? []).map((h) => (
              <li key={h.id} className="py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-navy">{eventLabel(h.event_type)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString()} · {h.status === "dismissed" ? "skipped" : "sent"}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{h.message}</p>
              </li>
            ))}
          </List>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-primary-foreground/10 p-3">
      <div className="truncate text-lg font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Package; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 font-display font-bold text-brand-navy">
      <Icon className="h-4 w-4 text-brand-orange" /> {title}
    </div>
  );
}

function List({ children, empty }: { children: React.ReactNode[]; empty: string }) {
  if (!children.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <ul className="max-h-80 divide-y overflow-y-auto">{children}</ul>;
}
