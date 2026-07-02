import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ops/PageHeader";
import { Package, Ship, Wallet, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["report-summary"],
    queryFn: async () => {
      const [packages, shipments, invoices, contacts] = await Promise.all([
        supabase.from("packages").select("id, cbm, weight_kg, status"),
        supabase.from("shipments").select("id, status, mode"),
        supabase.from("invoices").select("id, total, amount_paid, currency, status"),
        supabase.from("contacts").select("id, status"),
      ]);
      return {
        packages: packages.data ?? [],
        shipments: shipments.data ?? [],
        invoices: invoices.data ?? [],
        contacts: contacts.data ?? [],
      };
    },
  });

  const totalCbm = data?.packages.reduce((s, p) => s + Number(p.cbm ?? 0), 0) ?? 0;
  const activeShipments = data?.shipments.filter((s) => !["closed", "cancelled"].includes(s.status)).length ?? 0;
  const outstanding = data?.invoices.reduce((s, i) => s + (Number(i.total) - Number(i.amount_paid)), 0) ?? 0;
  const activeCustomers = data?.contacts.filter((c) => ["active", "vip"].includes(c.status)).length ?? 0;

  const kpis = [
    { icon: Package, label: "Total CBM handled", value: totalCbm.toFixed(2), sub: `${data?.packages.length ?? 0} packages` },
    { icon: Ship, label: "Active shipments", value: activeShipments, sub: `${data?.shipments.length ?? 0} total` },
    { icon: Wallet, label: "Outstanding (mixed)", value: outstanding.toFixed(2), sub: "Sum across currencies" },
    { icon: Users, label: "Active customers", value: activeCustomers, sub: `${data?.contacts.length ?? 0} contacts` },
  ];

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Business snapshot across warehousing, shipping, billing, and CRM."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="mt-2 font-display text-3xl font-extrabold text-brand-navy">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
              </div>
              <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
                <k.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
