import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ops/PageHeader";
import { Package, Ship, Users, TrendingUp, Truck, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["report-summary"],
    queryFn: async () => {
      const [packages, shipments, invoices, contacts, deliveries, pos] = await Promise.all([
        supabase.from("packages").select("id, cbm, weight_kg, status"),
        supabase.from("shipments").select("id, status, mode"),
        supabase.from("invoices").select("id, total, amount_paid, currency, status"),
        supabase.from("contacts").select("id, status"),
        supabase.from("deliveries").select("id, status, city, fee_amount, fee_currency"),
        supabase.from("purchase_orders").select("id, status, margin_amount, currency"),
      ]);
      return {
        packages: packages.data ?? [],
        shipments: shipments.data ?? [],
        invoices: invoices.data ?? [],
        contacts: contacts.data ?? [],
        deliveries: deliveries.data ?? [],
        pos: pos.data ?? [],
      };
    },
  });

  const totalCbm = data?.packages.reduce((s, p) => s + Number(p.cbm ?? 0), 0) ?? 0;
  const activeShipments =
    data?.shipments.filter((s) => !["closed", "cancelled"].includes(s.status)).length ?? 0;
  const activeCustomers =
    data?.contacts.filter((c) => ["active", "vip"].includes(c.status)).length ?? 0;

  const outstandingByCurrency = useMemo(() => {
    const m: Record<string, number> = {};
    for (const inv of data?.invoices ?? []) {
      if (inv.status === "void") continue;
      m[inv.currency] = (m[inv.currency] ?? 0) + (Number(inv.total) - Number(inv.amount_paid));
    }
    return m;
  }, [data]);

  const revenueByCurrency = useMemo(() => {
    const m: Record<string, number> = {};
    for (const inv of data?.invoices ?? []) {
      if (inv.status === "void") continue;
      m[inv.currency] = (m[inv.currency] ?? 0) + Number(inv.amount_paid);
    }
    return m;
  }, [data]);

  const marginByCurrency = useMemo(() => {
    const m: Record<string, number> = {};
    for (const po of data?.pos ?? []) {
      if (po.status === "cancelled") continue;
      m[po.currency] = (m[po.currency] ?? 0) + Number(po.margin_amount);
    }
    return m;
  }, [data]);

  const deliveryStats = useMemo(() => {
    const total = data?.deliveries.length ?? 0;
    const delivered = data?.deliveries.filter((d) => d.status === "delivered").length ?? 0;
    const failed = data?.deliveries.filter((d) => d.status === "failed").length ?? 0;
    return { total, delivered, failed, rate: total ? Math.round((delivered / total) * 100) : 0 };
  }, [data]);

  const topCorridors = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of data?.deliveries ?? []) {
      if (!d.city) continue;
      m[d.city] = (m[d.city] ?? 0) + 1;
    }
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [data]);

  const kpis = [
    {
      icon: Package,
      label: "Total CBM handled",
      value: totalCbm.toFixed(2),
      sub: `${data?.packages.length ?? 0} packages`,
    },
    {
      icon: Ship,
      label: "Active shipments",
      value: activeShipments,
      sub: `${data?.shipments.length ?? 0} total`,
    },
    {
      icon: Users,
      label: "Active customers",
      value: activeCustomers,
      sub: `${data?.contacts.length ?? 0} contacts`,
    },
    {
      icon: Truck,
      label: "Delivery success rate",
      value: `${deliveryStats.rate}%`,
      sub: `${deliveryStats.delivered}/${deliveryStats.total} delivered`,
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Business snapshot across warehousing, shipping, billing, sourcing, and CRM."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {k.label}
                </div>
                <div className="mt-2 font-display text-3xl font-extrabold text-brand-navy">
                  {k.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
              </div>
              <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-orange" />
            <h3 className="font-display text-base font-bold text-brand-navy">
              Revenue collected vs outstanding
            </h3>
          </div>
          {Object.keys(revenueByCurrency).length === 0 &&
          Object.keys(outstandingByCurrency).length === 0 ? (
            <div className="text-sm text-muted-foreground">No invoices yet.</div>
          ) : (
            <div className="grid gap-2">
              {Array.from(
                new Set([...Object.keys(revenueByCurrency), ...Object.keys(outstandingByCurrency)]),
              ).map((cur) => (
                <div
                  key={cur}
                  className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                >
                  <span className="font-semibold">{cur}</span>
                  <span>
                    <span className="text-emerald-700 font-semibold">
                      {(revenueByCurrency[cur] ?? 0).toFixed(2)} collected
                    </span>
                    {" · "}
                    <span className="text-brand-orange font-semibold">
                      {(outstandingByCurrency[cur] ?? 0).toFixed(2)} outstanding
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-brand-orange" />
            <h3 className="font-display text-base font-bold text-brand-navy">
              Sourcing margin captured
            </h3>
          </div>
          {Object.keys(marginByCurrency).length === 0 ? (
            <div className="text-sm text-muted-foreground">No purchase orders yet.</div>
          ) : (
            <div className="grid gap-2">
              {Object.entries(marginByCurrency).map(([cur, amt]) => (
                <div
                  key={cur}
                  className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                >
                  <span className="font-semibold">{cur}</span>
                  <span className="font-semibold text-brand-navy">{amt.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 md:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4 text-brand-orange" />
            <h3 className="font-display text-base font-bold text-brand-navy">
              Top delivery corridors (by city)
            </h3>
          </div>
          {topCorridors.length === 0 ? (
            <div className="text-sm text-muted-foreground">No deliveries yet.</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
              {topCorridors.map(([city, count]) => (
                <div key={city} className="rounded-md bg-muted p-3 text-center">
                  <div className="font-display text-xl font-extrabold text-brand-navy">{count}</div>
                  <div className="text-xs text-muted-foreground">{city}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
