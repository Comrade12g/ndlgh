import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ops/PageHeader";
import { ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditLogPage,
});

type InviteRow = {
  id: string;
  invite_type: "customer" | "staff";
  target_name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  reused: boolean;
  invited_by_name: string | null;
  whatsapp_status: string;
  whatsapp_sent_at: string | null;
  whatsapp_error: string | null;
  email_status: string;
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
};

function toneFor(status: string): "green" | "amber" | "orange" | "neutral" {
  if (status === "initiated" || status === "sent") return "green";
  if (status === "failed") return "orange";
  if (status === "skipped") return "neutral";
  return "amber";
}

function AuditLogPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["invite-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invite_audit_log")
        .select(
          "id, invite_type, target_name, phone, email, role, reused, invited_by_name, whatsapp_status, whatsapp_sent_at, whatsapp_error, email_status, email_sent_at, email_error, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as InviteRow[];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Invite audit log"
        description="Who sent each customer or employee invite, when, and whether WhatsApp/email delivery succeeded."
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">{(error as Error).message}</div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No invites logged yet"
            description="Once you create a customer or employee login, it will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Phone / Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Invited by</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-foreground">
                        {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={row.invite_type === "staff" ? "navy" : "sky"}>
                        {row.invite_type}
                      </StatusBadge>
                      {row.reused ? (
                        <div className="mt-1 text-xs text-muted-foreground">password reset</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.target_name ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <div>{row.phone ?? "—"}</div>
                      {row.email ? <div className="text-muted-foreground">{row.email}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-xs">{row.role ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground">{row.invited_by_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={toneFor(row.whatsapp_status)}>
                        {row.whatsapp_status}
                      </StatusBadge>
                      {row.whatsapp_sent_at ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(row.whatsapp_sent_at).toLocaleString()}
                        </div>
                      ) : null}
                      {row.whatsapp_error ? (
                        <div className="mt-1 text-xs text-destructive">{row.whatsapp_error}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={toneFor(row.email_status)}>{row.email_status}</StatusBadge>
                      {row.email_error ? (
                        <div className="mt-1 text-xs text-destructive">{row.email_error}</div>
                      ) : null}
                    </td>
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
