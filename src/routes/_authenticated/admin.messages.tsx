import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, EmptyState, StatusBadge } from "@/components/ops/PageHeader";
import { getSmsBalance, sendSms, SMS_CODES } from "@/lib/sms.functions";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  head: () => ({ meta: [{ title: "Message log — NDL Ops" }] }),
  component: MessageLogPage,
});

type Row = {
  id: string; event_type: string; channel: string; phone: string | null; message: string;
  status: string; created_at: string;
  profiles: { full_name: string | null; shipping_mark: string } | null;
};

function describe(status: string) {
  if (status === "sent") return { label: "Sent", tone: "green" as const };
  if (status.startsWith("failed")) {
    const code = status.split(":")[1] ?? "";
    return { label: `Failed — ${SMS_CODES[code] ?? code}`, tone: "orange" as const };
  }
  if (status === "clicked") return { label: "WhatsApp opened", tone: "neutral" as const };
  return { label: "Pending", tone: "amber" as const };
}

function MessageLogPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "failed" | "sent" | "pending">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const balance = useQuery({ queryKey: ["sms-balance"], queryFn: () => getSmsBalance() });
  const { data, isLoading } = useQuery({
    queryKey: ["message-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_notifications")
        .select("id, event_type, channel, phone, message, status, created_at, profiles:customer_id(full_name, shipping_mark)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (filter === "failed" && !r.status.startsWith("failed")) return false;
      if (filter === "sent" && r.status !== "sent") return false;
      if (filter === "pending" && r.status !== "pending") return false;
      if (!s) return true;
      return [r.profiles?.full_name, r.profiles?.shipping_mark, r.phone, r.message, r.event_type]
        .some((v) => v?.toLowerCase().includes(s));
    });
  }, [data, filter, q]);

  const failedCount = (data ?? []).filter((r) => r.status.startsWith("failed")).length;
  const bal = balance.data?.balance;

  async function retry(r: Row) {
    if (!r.phone) return toast.error("No phone number on this message");
    setBusy(r.id);
    try {
      const res = await sendSms({ data: { notificationId: r.id, phone: r.phone, message: r.message } });
      res.ok ? toast.success("SMS sent") : toast.error(`Failed: ${res.reason}`);
      qc.invalidateQueries({ queryKey: ["message-log"] });
      qc.invalidateQueries({ queryKey: ["sms-balance"] });
    } finally { setBusy(null); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Message log" description="Every text message sent to customers, with its result — so mistakes are caught quickly." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">SMS credits left</div>
          <div className={`text-2xl font-bold ${bal != null && bal < 25 ? "text-destructive" : "text-brand-navy"}`}>
            {balance.isLoading ? "…" : bal ?? "—"}
          </div>
          {bal != null && bal < 25 && <div className="text-xs text-destructive">Low — top up soon</div>}
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Messages logged</div>
          <div className="text-2xl font-bold text-brand-navy">{data?.length ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Failed</div>
          <div className={`text-2xl font-bold ${failedCount ? "text-destructive" : "text-brand-navy"}`}>{failedCount}</div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "failed", "sent", "pending"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
        ))}
        <Input placeholder="Search name, ND####, phone…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? <div className="p-6 text-sm text-muted-foreground">Loading…</div> : rows.length === 0 ? (
          <EmptyState title="No messages" description="Messages appear here as soon as they are sent." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr><th className="p-3">When</th><th className="p-3">Customer</th><th className="p-3">Event</th><th className="p-3">Message</th><th className="p-3">Result</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const d = describe(r.status);
                  return (
                    <tr key={r.id} className="border-t align-top">
                      <td className="p-3 whitespace-nowrap">{format(new Date(r.created_at), "dd MMM HH:mm")}</td>
                      <td className="p-3">
                        <div className="font-medium">{r.profiles?.full_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.profiles?.shipping_mark} · {r.phone ?? "no phone"}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">{r.event_type.replace(/_/g, " ")}</td>
                      <td className="p-3 max-w-md">{r.message}</td>
                      <td className="p-3"><StatusBadge tone={d.tone}>{d.label}</StatusBadge></td>
                      <td className="p-3 whitespace-nowrap space-x-1">
                        {r.status !== "sent" && (
                          <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => retry(r)}>Retry SMS</Button>
                        )}
                        {r.phone && <Button size="sm" variant="ghost" onClick={() => openWhatsApp(r.phone!, r.message)}>WhatsApp</Button>}
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
