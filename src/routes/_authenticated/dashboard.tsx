import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Package, Ship, Truck, Wallet, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const STATS = [
  { icon: Package, label: "Packages in warehouses", value: "—", trend: "" },
  { icon: Ship, label: "Shipments in transit", value: "—", trend: "" },
  { icon: Truck, label: "Deliveries this week", value: "—", trend: "" },
  { icon: Users, label: "Active customers", value: "—", trend: "" },
  { icon: Wallet, label: "Outstanding invoices", value: "—", trend: "" },
  { icon: TrendingUp, label: "Revenue MTD", value: "—", trend: "" },
];

function Dashboard() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Overview</div>
        <h1 className="font-display text-3xl font-extrabold text-brand-navy">Ops Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live status of shipments, sourcing, treasury and deliveries across all NDL hubs.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-2 font-display text-3xl font-extrabold text-brand-navy">{s.value}</div>
              </div>
              <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-dashed p-8 text-center">
        <div className="font-display text-lg font-bold text-brand-navy">Phase 1 Foundation Complete</div>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Auth, roles, warehouses, and shipping-mark generation are live. Next: CRM contacts,
          package intake, and the sourcing/treasury ledger.
        </p>
      </div>
    </div>
  );
}
