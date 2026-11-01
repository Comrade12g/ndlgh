import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState } from "@/components/ops/PageHeader";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";
import { MessageCircle, Phone, Mail, Copy, Search, Wallet, ShoppingBag, GraduationCap, MapPin, Clock, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/service-requests")({
  head: () => ({ meta: [{ title: "China requests — NDL Ops" }] }),
  component: ServiceRequestsPage,
});

const STATUSES = ["new", "contacted", "in_progress", "done", "closed"] as const;
const STATUS_LABEL: Record<string, string> = {
  new: "New", contacted: "Contacted", in_progress: "In progress", done: "Done", closed: "Closed",
};
const STATUS_STYLE: Record<string, string> = {
  new: "bg-brand-orange text-white",
  contacted: "bg-brand-sky/15 text-brand-sky",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  closed: "bg-muted text-muted-foreground",
};
const SERVICE: Record<string, { label: string; icon: typeof Wallet }> = {
  supplier_payment: { label: "Supplier payment", icon: Wallet },
  supplier_payments: { label: "Supplier payment", icon: Wallet },
  procurement: { label: "Procurement & sourcing", icon: ShoppingBag },
  training: { label: "Import training", icon: GraduationCap },
};
const svc = (s: string) => SERVICE[s] ?? { label: s.replace(/_/g, " "), icon: ShoppingBag };

function ServiceRequestsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<string>("new");
  const [q, setQ] = useState("");
  const { data = [] } = useQuery({
    queryKey: ["service-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests").select("*").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return data;
    },
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.length };
    for (const r of data) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [data]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.filter((r) => (tab === "all" || r.status === tab) &&
      (!t || [r.full_name, r.phone, r.email, r.what_to_buy_or_pay_for, r.message].some((v) => v?.toLowerCase().includes(t))));
  }, [data, tab, q]);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${STATUS_LABEL[status] ?? status}`);
    qc.invalidateQueries({ queryKey: ["service-requests"] });
  }

  function whatsapp(r: (typeof data)[number]) {
    const msg = `Hello ${r.full_name}, thank you for contacting NDL Cargo about your ${svc(r.service_needed).label.toLowerCase()} request${r.what_to_buy_or_pay_for ? ` (${r.what_to_buy_or_pay_for})` : ""}. How can we help you get started?`;
    openWhatsApp(r.phone, msg);
    if (r.status === "new") setStatus(r.id, "contacted");
  }

  const tabs = ["new", "contacted", "in_progress", "done", "closed", "all"];

  return (
    <div className="p-6 md:p-8">
      <PageHeader eyebrow="Buy from China" title="Service requests"
        description="Supplier payment, procurement and training requests from the website." />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["new", "New"], ["contacted", "Contacted"], ["in_progress", "In progress"], ["all", "Total"]].map(([k, l]) => (
          <Card key={k} className={`p-4 ${k === "new" && counts.new ? "border-brand-orange" : ""}`}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className={`mt-1 font-display text-2xl font-bold ${k === "new" ? "text-brand-orange" : "text-brand-navy"}`}>{counts[k] ?? 0}</div>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${tab === t ? "bg-brand-navy text-white" : "bg-muted text-foreground hover:bg-muted/70"}`}>
            {t === "all" ? "All" : STATUS_LABEL[t]} <span className="ml-1 opacity-70">{counts[t] ?? 0}</span>
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Search requests" placeholder="Search name, phone, item…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="No requests here" description="Website submissions will appear here." />
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const s = svc(r.service_needed);
            return (
              <Card key={r.id} className={`overflow-hidden ${r.status === "new" ? "border-l-4 border-l-brand-orange" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-brand-navy">{r.full_name}</div>
                      <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        <span>{r.phone}</span>{r.email && <span>{r.email}</span>}
                        <span title={format(new Date(r.created_at), "PPpp")}>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold text-brand-orange">
                      <s.icon className="h-3.5 w-3.5" /> {s.label}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[r.status] ?? "bg-muted"}`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
                  <div className="space-y-3">
                    {r.what_to_buy_or_pay_for && (
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Wants to buy / pay for</div>
                        <div className="font-medium">{r.what_to_buy_or_pay_for}</div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 text-sm">
                      {r.approximate_amount_or_budget && <Chip icon={Wallet} label="Budget" value={r.approximate_amount_or_budget} />}
                      {r.supplier_location && <Chip icon={MapPin} label="Supplier" value={r.supplier_location} />}
                      {r.preferred_contact_time && <Chip icon={Clock} label="Best time" value={r.preferred_contact_time} />}
                      {r.experience_level && <Chip icon={GraduationCap} label="Experience" value={r.experience_level} />}
                    </div>
                    {r.message && (
                      <blockquote className="rounded-md border-l-4 border-brand-sky bg-brand-sky/5 p-3 text-sm whitespace-pre-wrap">{r.message}</blockquote>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 md:w-48">
                    <Button size="sm" className="bg-[#25D366] text-white hover:bg-[#25D366]/90" onClick={() => whatsapp(r)}>
                      <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" asChild><a href={`tel:${r.phone}`}><Phone className="mr-1.5 h-4 w-4" /> Call</a></Button>
                    {r.email && <Button size="sm" variant="outline" asChild><a href={`mailto:${r.email}`}><Mail className="mr-1.5 h-4 w-4" /> Email</a></Button>}
                    <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(r.phone); toast.success("Phone copied"); }}>
                      <Copy className="mr-1.5 h-4 w-4" /> Copy phone
                    </Button>
                    <select aria-label="Status" value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}
                      className="h-9 rounded-md border bg-background px-2 text-sm">
                      {STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1">
      <Icon className="h-3.5 w-3.5 text-brand-sky" />
      <span className="text-muted-foreground">{label}:</span> <span className="font-medium">{value}</span>
    </span>
  );
}
