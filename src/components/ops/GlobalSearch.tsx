import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Package, Ship, MessageCircle, Phone } from "lucide-react";
import { sanitizePostgrestTerm } from "@/lib/utils";

type Customer = { id: string; full_name: string | null; phone: string | null; shipping_mark: string };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const term = sanitizePostgrestTerm(q.trim());
  const { data, isFetching } = useQuery({
    queryKey: ["global-search", term],
    enabled: open && term.length >= 2,
    queryFn: async () => {
      const like = `%${term}%`;
      const [c, p, s] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone, shipping_mark")
          .or(`shipping_mark.ilike.${like},full_name.ilike.${like},phone.ilike.${like}`)
          .limit(8),
        supabase
          .from("packages")
          .select("id, tracking_code, shipping_mark, external_tracking, description, status")
          .or(`tracking_code.ilike.${like},external_tracking.ilike.${like},shipping_mark.ilike.${like}`)
          .limit(8),
        supabase
          .from("shipments")
          .select("id, code, ndl_reference, container_no, status, eta")
          .or(`code.ilike.${like},ndl_reference.ilike.${like},container_no.ilike.${like},bol_no.ilike.${like}`)
          .limit(6),
      ]);
      return { customers: c.data ?? [], packages: p.data ?? [], shipments: s.data ?? [] };
    },
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full justify-start border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
      >
        <Search className="mr-2 h-4 w-4" /> Search…
        <span className="ml-auto text-[10px] text-white/50">Ctrl K</span>
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCustomer(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{customer ? "Customer card" : "Search everything"}</DialogTitle>
          </DialogHeader>
          {customer ? (
            <CustomerCard c={customer} onBack={() => setCustomer(null)} />
          ) : (
            <div className="grid gap-3">
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Customer ID (ND0001), name, phone, tracking, container…"
              />
              <div className="max-h-[60vh] space-y-4 overflow-y-auto">
                {term.length < 2 && <p className="text-sm text-muted-foreground">Type at least 2 characters.</p>}
                {isFetching && <p className="text-sm text-muted-foreground">Searching…</p>}
                {data && (
                  <>
                    <Group title="Customers">
                      {data.customers.map((c) => (
                        <Row key={c.id} icon={User} onClick={() => setCustomer(c as Customer)}
                          main={`${c.shipping_mark} · ${c.full_name ?? "—"}`} sub={c.phone ?? ""} />
                      ))}
                    </Group>
                    <Group title="Packages">
                      {data.packages.map((p) => (
                        <Row key={p.id} icon={Package} main={`${p.tracking_code} · ${p.shipping_mark ?? "unmatched"}`}
                          sub={`${p.external_tracking ?? ""} ${p.description ?? ""} · ${p.status}`} />
                      ))}
                    </Group>
                    <Group title="Shipments">
                      {data.shipments.map((s) => (
                        <Row key={s.id} icon={Ship} main={`${s.ndl_reference ?? s.code} · ${s.status}`}
                          sub={`${s.container_no ?? ""} ${s.eta ? "ETA " + s.eta : ""}`} />
                      ))}
                    </Group>
                    {!data.customers.length && !data.packages.length && !data.shipments.length && (
                      <p className="text-sm text-muted-foreground">No matches.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode[] }) {
  if (!children.length) return null;
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="divide-y rounded-md border">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, main, sub, onClick }: { icon: typeof User; main: string; sub: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 disabled:cursor-default">
      <Icon className="h-4 w-4 text-brand-orange" />
      <div className="min-w-0">
        <div className="truncate font-medium">{main}</div>
        <div className="truncate text-xs text-muted-foreground">{sub}</div>
      </div>
    </button>
  );
}

function CustomerCard({ c, onBack }: { c: Customer; onBack: () => void }) {
  const { data } = useQuery({
    queryKey: ["customer-card", c.id],
    queryFn: async () => {
      const [p, i] = await Promise.all([
        supabase.from("packages").select("id, tracking_code, description, status, weight_kg, cbm, received_at")
          .eq("customer_id", c.id).order("received_at", { ascending: false }).limit(20),
        supabase.from("invoices").select("id, number, total, amount_paid, currency, status")
          .eq("customer_id", c.id).order("created_at", { ascending: false }).limit(20),
      ]);
      return { packages: p.data ?? [], invoices: i.data ?? [] };
    },
  });
  const balance = (data?.invoices ?? [])
    .filter((x) => x.status !== "void")
    .reduce((s, x) => s + Number(x.total) - Number(x.amount_paid), 0);
  const wa = c.phone?.replace(/\D/g, "");
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="font-mono text-lg font-bold text-brand-orange">{c.shipping_mark}</div>
        <div className="font-semibold">{c.full_name ?? "—"}</div>
        <div className="ml-auto flex gap-2">
          {wa && (
            <Button size="sm" variant="outline" asChild>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-1 h-4 w-4" />WhatsApp</a>
            </Button>
          )}
          {c.phone && (
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${c.phone}`}><Phone className="mr-1 h-4 w-4" />Call</a>
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Packages" value={String(data?.packages.length ?? "…")} />
        <Stat label="Invoices" value={String(data?.invoices.length ?? "…")} />
        <Stat label="Balance owed" value={balance.toFixed(2)} />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-md border text-sm">
        {(data?.packages ?? []).map((p) => (
          <div key={p.id} className="flex justify-between border-b px-3 py-2 last:border-0">
            <span className="font-mono text-xs">{p.tracking_code}</span>
            <span className="truncate px-2">{p.description ?? ""}</span>
            <span className="text-xs text-muted-foreground">{p.status}</span>
          </div>
        ))}
        {data && !data.packages.length && <div className="p-3 text-muted-foreground">No packages yet.</div>}
      </div>
      <Button variant="ghost" size="sm" onClick={onBack} className="justify-self-start">← Back to results</Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xl font-bold text-brand-navy">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
