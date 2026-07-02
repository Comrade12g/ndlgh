import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ops/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

const ROLE_TONE: Record<string, "orange" | "navy" | "sky" | "green" | "neutral"> = {
  admin: "orange",
  ops_warehouse: "navy",
  sales_accountant: "sky",
  sourcing_agent: "green",
  driver: "neutral",
  customer: "neutral",
};

function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, shipping_mark, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const rolesByUser = new Map<string, string[]>();
      for (const r of roles ?? []) {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role);
        rolesByUser.set(r.user_id, arr);
      }
      return (profiles ?? []).map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] }));
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Admin"
        title="Users & roles"
        description="Everyone in the NDL system — staff, agents, drivers, and customers with their shipping marks."
      />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !data?.length ? (
          <EmptyState title="No users yet" description="Users appear here after sign-up." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Shipping mark</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Roles</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-orange">{u.shipping_mark}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length ? u.roles.map((r) => (
                          <StatusBadge key={r} tone={ROLE_TONE[r] ?? "neutral"}>{r.replace("_", " ")}</StatusBadge>
                        )) : <span className="text-xs text-muted-foreground">no role</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
