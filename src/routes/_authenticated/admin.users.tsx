import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ops/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

const ROLES = [
  "admin",
  "ops_warehouse",
  "sales",
  "accountant",
  "customer_service",
  "sourcing_agent",
  "driver",
  "customer",
] as const;

const ROLE_TONE: Record<string, "orange" | "navy" | "sky" | "green" | "amber" | "neutral"> = {
  admin: "orange",
  ops_warehouse: "navy",
  sales: "sky",
  accountant: "green",
  customer_service: "amber",
  sales_accountant: "sky",
  sourcing_agent: "green",
  driver: "neutral",
  customer: "neutral",
};

function AdminUsersPage() {
  const qc = useQueryClient();
  const [pending, setPending] = useState<Record<string, string>>({});
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, shipping_mark, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("id, user_id, role");
      const rolesByUser = new Map<string, { id: string; role: string }[]>();
      for (const r of roles ?? []) {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push({ id: r.id, role: r.role });
        rolesByUser.set(r.user_id, arr);
      }
      return (profiles ?? []).map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] }));
    },
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role as never });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role added");
      qc.invalidateQueries({ queryKey: ["users-with-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role removed");
      qc.invalidateQueries({ queryKey: ["users-with-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Admin"
        title="Users & roles"
        description="Assign staff roles: Sales, Accountant, Customer Service, Sourcing Agent, Warehouse Ops, Driver, Admin."
        actions={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <UserPlus className="mr-2 h-4 w-4" /> Invite employee
              </Button>
            </DialogTrigger>
            <InviteStaffDialog
              onDone={() => {
                setInviteOpen(false);
                qc.invalidateQueries({ queryKey: ["users-with-roles"] });
              }}
            />
          </Dialog>
        }
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
                  <th className="px-4 py-3 text-left">Add role</th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => {
                  const existing = new Set(u.roles.map((r) => r.role));
                  const options = ROLES.filter((r) => !existing.has(r));
                  return (
                    <tr key={u.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-brand-navy">{u.full_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-orange">
                        {u.shipping_mark}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length ? (
                            u.roles.map((r) => (
                              <span key={r.id} className="inline-flex items-center gap-1">
                                <StatusBadge tone={ROLE_TONE[r.role] ?? "neutral"}>
                                  {r.role.replace(/_/g, " ")}
                                </StatusBadge>
                                <button
                                  onClick={() => removeRole.mutate(r.id)}
                                  className="text-muted-foreground hover:text-red-600"
                                  title="Remove role"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">no role</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={pending[u.id] ?? ""}
                            onValueChange={(v) => setPending((s) => ({ ...s, [u.id]: v }))}
                          >
                            <SelectTrigger className="h-8 w-40 text-xs">
                              <SelectValue placeholder="Select role…" />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((r) => (
                                <SelectItem key={r} value={r} className="text-xs">
                                  {r.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!pending[u.id]}
                            onClick={() => {
                              const role = pending[u.id];
                              if (!role) return;
                              addRole.mutate({ userId: u.id, role });
                              setPending((s) => ({ ...s, [u.id]: "" }));
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

const INVITE_ROLES = ROLES.filter((r) => r !== "customer");

function InviteStaffDialog({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("");

  const mut = useMutation({
    mutationFn: async () => {
      if (!role) throw new Error("Select a role");
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("invite-staff", {
        body: {
          email,
          full_name: fullName || null,
          phone: phone || null,
          role,
          redirectTo: `${window.location.origin}/accept-invite`,
        },
        headers: session.session
          ? { Authorization: `Bearer ${session.session.access_token}` }
          : undefined,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success(`Invite sent to ${email}`);
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-brand-orange" /> Invite employee
        </DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-3"
      >
        <div className="grid gap-2">
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Work email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 …" />
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role…" />
            </SelectTrigger>
            <SelectContent>
              {INVITE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          They'll get an email with a secure link to set their own password and sign straight into
          the dashboard with this role already assigned.
        </p>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Sending invite…" : "Send invite"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
