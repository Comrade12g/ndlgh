import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { PendingNotifications } from "@/components/ops/PendingNotifications";
import { CustomerServiceCard, type CsCustomer } from "@/components/ops/CustomerServiceCard";
import { Search } from "lucide-react";
import { sanitizePostgrestTerm } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({ meta: [{ title: "Customer Service — NDL" }, { name: "robots", content: "noindex, nofollow" }] }),
  validateSearch: (s: Record<string, unknown>): { customer?: string } =>
    typeof s.customer === "string" ? { customer: s.customer } : {},
  component: SupportPage,
});

function SupportPage() {
  const { customer: customerId } = Route.useSearch();
  const navigate = useNavigate({ from: "/support" });
  const [q, setQ] = useState("");
  const term = sanitizePostgrestTerm(q.trim());
  const select = (id?: string) => navigate({ search: id ? { customer: id } : {} });

  const { data: selected } = useQuery({
    queryKey: ["cs-selected", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, shipping_mark")
        .eq("id", customerId!)
        .maybeSingle();
      return data as CsCustomer | null;
    },
  });

  const { data } = useQuery({
    queryKey: ["cs-search", term],
    enabled: term.length >= 2,
    queryFn: async () => {
      const like = `%${term}%`;
      const [c, p] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone, shipping_mark")
          .or(`shipping_mark.ilike.${like},full_name.ilike.${like},phone.ilike.${like}`)
          .limit(20),
        supabase
          .from("packages")
          .select("id, tracking_code, external_tracking, description, status, customer_id, shipping_mark")
          .or(`tracking_code.ilike.${like},external_tracking.ilike.${like},shipping_mark.ilike.${like},description.ilike.${like}`)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);
      return { customers: (c.data ?? []) as CsCustomer[], packages: p.data ?? [] };
    },
  });

  if (customerId && selected) {
    return (
      <div className="p-6 md:p-8">
        <CustomerServiceCard c={selected} onBack={() => select()} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Customer Service"
        title="Customer service desk"
        description="Send waiting updates, look up any customer, and answer their questions from one place."
      />

      <PendingNotifications />

      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Customer ID (ND0001), name, phone, tracking or courier number…"
            className="pl-9"
          />
        </div>
      </Card>

      {term.length < 2 ? (
        <EmptyState title="Start typing to search" description="Click a customer to open their full record." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3 font-display text-sm font-bold text-brand-navy">
              Customers {data?.customers.length ? `(${data.customers.length})` : ""}
            </div>
            {!data?.customers.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No customers matched.</div>
            ) : (
              <ul className="divide-y">
                {data.customers.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30"
                    >
                      <div>
                        <div className="font-semibold text-brand-navy">{c.full_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{c.phone ?? "no phone"}</div>
                      </div>
                      <div className="font-mono text-xs font-bold text-brand-orange">{c.shipping_mark}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3 font-display text-sm font-bold text-brand-navy">
              Packages {data?.packages.length ? `(${data.packages.length})` : ""}
            </div>
            {!data?.packages.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No packages matched.</div>
            ) : (
              <ul className="divide-y">
                {data.packages.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={!p.customer_id}
                      onClick={() => p.customer_id && select(p.customer_id)}
                      className="w-full px-4 py-3 text-left hover:bg-muted/30 disabled:cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand-navy">{p.tracking_code}</span>
                        <StatusBadge tone={statusTone(p.status)}>{p.status.replace(/_/g, " ")}</StatusBadge>
                      </div>
                      <div className="mt-1 text-sm text-brand-navy">{p.description ?? "—"}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Mark: <span className="font-mono text-brand-orange">{p.shipping_mark ?? "unmatched"}</span>
                        {p.external_tracking ? ` · Courier ${p.external_tracking}` : ""}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
