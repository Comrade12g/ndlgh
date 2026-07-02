import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";

export const Route = createFileRoute("/_authenticated/deliveries")({
  component: DeliveriesPage,
});

function DeliveriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select("id, code, recipient_name, recipient_phone, city, region, scheduled_for, status, fee_amount, fee_currency, delivered_at")
        .order("scheduled_for", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Dispatch"
        title="Deliveries"
        description="Last-mile intercity delivery in Ghana with driver assignments and POD (photo + signature)."
      />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !data?.length ? (
          <EmptyState title="No deliveries scheduled" description="Deliveries appear here as shipments arrive and get booked for last-mile." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Recipient</th>
                  <th className="px-4 py-3 text-left">City</th>
                  <th className="px-4 py-3 text-left">Scheduled</th>
                  <th className="px-4 py-3 text-right">Fee</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-navy">{d.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-navy">{d.recipient_name}</div>
                      <div className="text-xs text-muted-foreground">{d.recipient_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.city}{d.region ? `, ${d.region}` : ""}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.scheduled_for ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{d.fee_amount ? `${d.fee_currency} ${Number(d.fee_amount).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge tone={statusTone(d.status)}>{d.status.replace("_", " ")}</StatusBadge></td>
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
