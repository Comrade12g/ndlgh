import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // Check if this user is staff; customers go to /portal
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const staffRoles = ["admin", "ops_warehouse", "sales_accountant", "sourcing_agent", "driver"];
    const isStaff = roles?.some((r) => staffRoles.includes(r.role));
    if (!isStaff) throw redirect({ to: "/portal" });
    return { user: data.user };
  },
  component: StaffLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/crm/contacts", label: "CRM", icon: Users },
  { to: "/sourcing/pos", label: "Sourcing", icon: ShoppingBag },
  { to: "/treasury/accounts", label: "Treasury", icon: Wallet },
  { to: "/packages", label: "Packages", icon: Package },
  { to: "/shipments", label: "Shipments", icon: Ship },
  { to: "/deliveries", label: "Deliveries", icon: Truck },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/users", label: "Admin", icon: Settings },
];

function StaffLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["me-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("full_name, shipping_mark").eq("id", u.user.id).maybeSingle();
      return { email: u.user.email, ...data };
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
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
          {NAV.map((item) => {
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
            <div className="font-semibold text-white">{profile?.full_name ?? profile?.email ?? "Staff"}</div>
            {profile?.shipping_mark && <div className="font-mono text-white/60">{profile.shipping_mark}</div>}
          </div>
          <Button size="sm" variant="outline" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10" onClick={signOut}>
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
