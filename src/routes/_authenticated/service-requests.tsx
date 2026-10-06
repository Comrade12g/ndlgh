import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageHeader, EmptyState } from "@/components/ops/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/service-requests")({
  component: ServiceRequestsPage,
});

const STATUSES = ["new", "contacted", "in_progress", "done", "closed"];

function ServiceRequestsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["service-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["service-requests"] });
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Buy from China"
        title="Service requests"
        description="Supplier payment, procurement and training requests from the website."
      />
      {!data.length ? (
        <EmptyState title="No requests yet" description="Website submissions will appear here." />
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-brand-navy">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.phone}{r.email ? ` · ${r.email}` : ""} · {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                    {r.service_needed.replace("_", " ")}
                  </span>
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {r.what_to_buy_or_pay_for && <div><span className="text-muted-foreground">Buy/pay for: </span>{r.what_to_buy_or_pay_for}</div>}
                {r.approximate_amount_or_budget && <div><span className="text-muted-foreground">Budget: </span>{r.approximate_amount_or_budget}</div>}
                {r.supplier_location && <div><span className="text-muted-foreground">Supplier: </span>{r.supplier_location}</div>}
                {r.preferred_contact_time && <div><span className="text-muted-foreground">Contact time: </span>{r.preferred_contact_time}</div>}
                {r.experience_level && <div><span className="text-muted-foreground">Experience: </span>{r.experience_level}</div>}
                {r.message && <div className="sm:col-span-2"><span className="text-muted-foreground">Message: </span>{r.message}</div>}
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
