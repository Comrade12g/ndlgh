import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import {
  Package,
  Ship,
  Truck,
  Wallet,
  TrendingUp,
  Users,
  ShoppingBag,
  Receipt,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const authenticatedRoute = getRouteApi("/_authenticated");

function useCounts() {
  return useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const [pkg, shp, del, cont, inv, po] = await Promise.all([
        supabase.from("packages").select("id", { count: "exact", head: true }),
        supabase.from("shipments").select("id", { count: "exact", head: true }),
        supabase.from("deliveries").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }),
        supabase.from("purchase_orders").select("id", { count: "exact", head: true }),
      ]);
      return {
        packages: pkg.count ?? 0,
        shipments: shp.count ?? 0,
        deliveries: del.count ?? 0,
        contacts: cont.count ?? 0,
        invoices: inv.count ?? 0,
        purchaseOrders: po.count ?? 0,
      };
    },
  });
}

// Mirrors the role restrictions on each destination page (see NAV in
// _authenticated.tsx) so the dashboard never advertises a portal or figure
// the viewer isn't actually allowed to open.
const PORTALS = [
  {
    to: "/crm/contacts",
    icon: Users,
    title: "Sales",
    desc: "Leads, contacts, and customer pipeline",
    tone: "text-brand-sky",
    bg: "bg-brand-sky/10",
    roles: ["admin", "sales", "sales_accountant", "customer_service", "sourcing_agent"],
  },
  {
    to: "/invoices",
    icon: Receipt,
    title: "Accountant",
    desc: "Invoices, payments and receivables",
    tone: "text-emerald-700",
    bg: "bg-emerald-500/10",
    roles: ["admin", "accountant", "sales", "sales_accountant"],
  },
  {
    to: "/support",
    icon: Headphones,
    title: "Customer Service",
    desc: "Look up any customer or package",
    tone: "text-amber-700",
    bg: "bg-amber-500/10",
    roles: ["admin", "customer_service"],
  },
  {
    to: "/sourcing/pos",
    icon: ShoppingBag,
    title: "Sourcing Agent",
    desc: "China desk POs and supplier payments",
    tone: "text-brand-orange",
    bg: "bg-brand-orange/10",
    roles: ["admin", "sourcing_agent"],
  },
  {
    to: "/packages",
    icon: Package,
    title: "Warehouse Ops",
    desc: "Intake, CBM, and shipment loading",
    tone: "text-brand-navy",
    bg: "bg-brand-navy/10",
    roles: ["admin", "ops_warehouse", "customer_service"],
  },
  {
    to: "/treasury/accounts",
    icon: Wallet,
    title: "Treasury",
    desc: "Multi-country ledger and FX rates",
    tone: "text-emerald-700",
    bg: "bg-emerald-500/10",
    roles: ["admin", "accountant", "sales_accountant"],
  },
] as const;

function Dashboard() {
  const { roles } = authenticatedRoute.useRouteContext();
  const has = (allowed: readonly string[]) =>
    allowed.some((r) => (roles as readonly string[]).includes(r));

  const { data } = useCounts();

  const STATS = [
    {
      icon: Package,
      label: "Packages in warehouses",
      value: data?.packages ?? 0,
      roles: ["admin", "ops_warehouse", "customer_service"],
    },
    {
      icon: Ship,
      label: "Shipments",
      value: data?.shipments ?? 0,
      roles: ["admin", "ops_warehouse", "sales", "sales_accountant", "customer_service"],
    },
    {
      icon: Truck,
      label: "Deliveries",
      value: data?.deliveries ?? 0,
      roles: ["admin", "ops_warehouse", "driver", "customer_service"],
    },
    {
      icon: Users,
      label: "Contacts",
      value: data?.contacts ?? 0,
      roles: ["admin", "sales", "sales_accountant", "customer_service", "sourcing_agent"],
    },
    {
      icon: Receipt,
      label: "Invoices",
      value: data?.invoices ?? 0,
      roles: ["admin", "accountant", "sales", "sales_accountant"],
    },
    {
      icon: TrendingUp,
      label: "Purchase orders",
      value: data?.purchaseOrders ?? 0,
      roles: ["admin", "sourcing_agent", "accountant", "sales_accountant"],
    },
  ].filter((s) => has(s.roles));

  const visiblePortals = PORTALS.filter((p) => has(p.roles));

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
          Overview
        </div>
        <h1 className="font-display text-3xl font-extrabold text-brand-navy">Ops Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live status across the areas you have access to.
        </p>
      </div>

      {STATS.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((s) => (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="mt-2 font-display text-3xl font-extrabold text-brand-navy">
                    {s.value}
                  </div>
                </div>
                <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {visiblePortals.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-extrabold text-brand-navy">Team portals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visiblePortals.map((p) => (
              <Link key={p.to} to={p.to} className="group">
                <Card className="h-full p-5 transition hover:border-brand-orange/40 hover:shadow-md">
                  <div className={`mb-3 inline-flex rounded-lg ${p.bg} p-2 ${p.tone}`}>
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div className="font-display text-lg font-bold text-brand-navy">{p.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-orange">
                    Open portal{" "}
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
