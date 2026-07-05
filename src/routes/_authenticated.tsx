import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/ndl-logo.png.asset.json";
import {
  LayoutDashboard,
  Users,
  Package,
  Ship,
  Truck,
  Receipt,
  ShoppingBag,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Headphones,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const STAFF_ROLES = [
  "admin",
  "ops_warehouse",
  "sales_accountant",
  "sales",
  "accountant",
  "customer_service",
  "sourcing_agent",
  "driver",
] as const;

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const userRoles = (roles ?? []).map((r) => r.role);
    const isStaff = userRoles.some((r) => (STAFF_ROLES as readonly string[]).includes(r));
    if (!isStaff) {
      // A freshly-created staff account (no role assigned yet) should wait
      // for activation, not land in the customer portal. Only route to the
      // portal if they actually hold the customer role.
      if (userRoles.includes("customer")) throw redirect({ to: "/portal" });
      throw redirect({ to: "/pending-activation" });
    }
    return { user: data.user, roles: userRoles };
  },
  component: StaffLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: readonly string[];
};

const ALL: readonly string[] = STAFF_ROLES;

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
  {
    to: "/crm/contacts",
    label: "CRM",
    icon: Users,
    roles: ["admin", "sales", "sales_accountant", "customer_service", "sourcing_agent"],
  },
  {
    to: "/support",
    label: "Customer Service",
    icon: Headphones,
    roles: ["admin", "customer_service"],
  },
  { to: "/sourcing/pos", label: "Sourcing", icon: ShoppingBag, roles: ["admin", "sourcing_agent"] },
  {
    to: "/treasury/accounts",
    label: "Treasury",
    icon: Wallet,
    roles: ["admin", "accountant", "sales_accountant"],
  },
  {
    to: "/packages",
    label: "Packages",
    icon: Package,
    roles: ["admin", "ops_warehouse", "customer_service"],
  },
  {
    to: "/shipments",
    label: "Shipments",
    icon: Ship,
    roles: ["admin", "ops_warehouse", "sales", "sales_accountant", "customer_service"],
  },
  {
    to: "/deliveries",
    label: "Deliveries",
    icon: Truck,
    roles: ["admin", "ops_warehouse", "driver", "customer_service"],
  },
  {
    to: "/invoices",
    label: "Invoices",
    icon: Receipt,
    roles: ["admin", "accountant", "sales", "sales_accountant"],
  },
  {
    to: "/rates",
    label: "Rates",
    icon: Tags,
    roles: ["admin", "accountant", "sales", "sales_accountant"],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "accountant", "sales_accountant"],
  },
  { to: "/admin/users", label: "Admin", icon: Settings, roles: ["admin"] },
];

function StaffLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const ctx = Route.useRouteContext();
  const roles = ctx.roles ?? [];

  const { data: profile } = useQuery({
    queryKey: ["me-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, shipping_mark")
        .eq("id", u.user.id)
        .maybeSingle();
      return { email: u.user.email, ...data };
    },
  });

  const visible = NAV.filter((n) => n.roles.some((r) => (roles as readonly string[]).includes(r)));
  const primaryRole = roles.includes("admin")
    ? "Admin"
    : roles.includes("accountant")
      ? "Accountant"
      : roles.includes("sales") || roles.includes("sales_accountant")
        ? "Sales"
        : roles.includes("customer_service")
          ? "Customer Service"
          : roles.includes("sourcing_agent")
            ? "Sourcing Agent"
            : roles.includes("ops_warehouse")
              ? "Warehouse"
              : roles.includes("driver")
                ? "Driver"
                : "Staff";

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b border-sidebar-border p-5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-1.5">
              <img src={logoAsset.url} alt="NDL" className="h-7 w-7" />
            </div>
            <div>
              <div className="font-display text-base font-extrabold">
                NDL <span className="text-brand-orange">GHANA</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">Ops Console</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {visible.map((item) => {
            const active = pathname.startsWith(item.to.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 text-xs">
            <div className="font-semibold text-white">
              {profile?.full_name ?? profile?.email ?? "Staff"}
            </div>
            <div className="text-white/60">{primaryRole}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
