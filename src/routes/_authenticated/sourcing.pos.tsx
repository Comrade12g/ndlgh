import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";

export const Route = createFileRoute("/_authenticated/sourcing/pos")({
  component: SourcingPage,
});

function SourcingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("id, code, description, quantity, currency, supplier_cost, margin_amount, sell_price, status, proof_url, ordered_at, agent_id, customer_id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Sourcing · Internal"
        title="Purchase Orders"
        description="Agent-led POs to overseas suppliers. Track supplier cost, our margin, sell price, and payment proof. Not visible to customers."
      />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !data?.length ? (
          <EmptyState
            title="No purchase orders"
            description="Agents create POs when they source goods on behalf of customers. Each one records supplier cost, margin, and proof."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Margin</th>
                  <th className="px-4 py-3 text-right">Sell price</th>
                  <th className="px-4 py-3 text-left">Proof</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((po) => (
                  <tr key={po.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-navy">{po.code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{po.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{po.currency} {Number(po.supplier_cost).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-orange">{po.currency} {Number(po.margin_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-navy">{po.currency} {Number(po.sell_price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {po.proof_url ? (
                        <a href={po.proof_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand-sky hover:underline">View</a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge tone={statusTone(po.status)}>{po.status}</StatusBadge></td>
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
