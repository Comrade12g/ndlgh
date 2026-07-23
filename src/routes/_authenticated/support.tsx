import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { Search } from "lucide-react";
import { sanitizePostgrestTerm } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/support")({
  component: SupportPage,
});

function SupportPage() {
  const [q, setQ] = useState("");
  const term = q.trim();

  const { data: customers } = useQuery({
    queryKey: ["cs-customer-search", term],
    enabled: term.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, shipping_mark")
        .or(`shipping_mark.ilike.%${term}%,full_name.ilike.%${term}%,phone.ilike.%${term}%`)
        .limit(20);
      return data ?? [];
    },
  });

  const { data: packages } = useQuery({
    queryKey: ["cs-package-search", term],
    enabled: term.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from("packages")
        .select(
          "id, tracking_code, description, status, warehouse_code, cbm, weight_kg, created_at, shipping_mark",
        )
        .or(
          `tracking_code.ilike.%${term}%,shipping_mark.ilike.%${term}%,description.ilike.%${term}%`,
        )
        .order("created_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Customer Service"
        title="Customer support desk"
        description="Look up any customer, their shipping mark, or a package tracking code to answer inquiries."
      />

      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by shipping mark, tracking code, customer name, or phone…"
            className="pl-9"
          />
        </div>
      </Card>

      {term.length < 2 ? (
        <EmptyState
          title="Start typing to search"
          description="Enter at least 2 characters to look up customers or packages."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3 font-display text-sm font-bold text-brand-navy">
              Customers {customers?.length ? `(${customers.length})` : ""}
            </div>
            {!customers?.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No customers matched.
              </div>
            ) : (
              <ul className="divide-y">
                {customers.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
                  >
                    <div>
                      <div className="font-semibold text-brand-navy">{c.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{c.phone ?? "no phone"}</div>
                    </div>
                    <div className="font-mono text-xs font-bold text-brand-orange">
                      {c.shipping_mark}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3 font-display text-sm font-bold text-brand-navy">
              Packages {packages?.length ? `(${packages.length})` : ""}
            </div>
            {!packages?.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No packages matched.
              </div>
            ) : (
              <ul className="divide-y">
                {packages.map((p) => (
                  <li key={p.id} className="px-4 py-3 hover:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs font-bold text-brand-navy">
                        {p.tracking_code}
                      </div>
                      <StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge>
                    </div>
                    <div className="mt-1 text-sm text-brand-navy">{p.description ?? "—"}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        Mark: <span className="font-mono text-brand-orange">{p.shipping_mark}</span>
                      </span>
                      <span>Origin: {p.warehouse_code}</span>
                      {p.cbm ? <span>{Number(p.cbm).toFixed(3)} CBM</span> : null}
                      {p.weight_kg ? <span>{Number(p.weight_kg).toFixed(1)} kg</span> : null}
                    </div>
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
