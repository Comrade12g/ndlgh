import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";

export const Route = createFileRoute("/_authenticated/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, number, currency, subtotal, total, amount_paid, status, issue_date, due_date, customer_id, contacts:customer_id(full_name, company)")
        .order("issue_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Multi-currency invoices for freight, sourcing, and delivery. Track paid vs outstanding."
      />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !data?.length ? (
          <EmptyState title="No invoices yet" description="Issue your first invoice once a shipment or delivery is ready to bill." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Issued</th>
                  <th className="px-4 py-3 text-left">Due</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((inv) => {
                  const p = Array.isArray(inv.profiles) ? inv.profiles[0] : (inv.profiles as { full_name: string | null; shipping_mark: string | null } | null);
                  return (
                    <tr key={inv.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-brand-navy">{inv.number}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-brand-navy">{p?.full_name ?? "—"}</div>
                        <div className="font-mono text-xs text-brand-orange">{p?.shipping_mark ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.issue_date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.due_date ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{inv.currency} {Number(inv.total).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{inv.currency} {Number(inv.amount_paid).toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge tone={statusTone(inv.status)}>{inv.status}</StatusBadge></td>
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
