import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BOOKING_STATUS, SIZE_LABEL } from "@/components/portal/ContainerBookings";

export const Route = createFileRoute("/_authenticated/containers")({
  head: () => ({ meta: [{ title: "Container bookings — NDL" }, { name: "robots", content: "noindex" }] }),
  component: ContainersPage,
});

function ContainersPage() {
  const qc = useQueryClient();
  const { data: rows } = useQuery({
    queryKey: ["staff-container-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("container_bookings")
        .select("id, code, container_size, quantity, origin_city, delivery_city, commodity, cargo_ready_date, notes, status, container_no, shipment_id, created_at, profiles(full_name, phone, shipping_mark)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: shipments } = useQuery({
    queryKey: ["fcl-shipments"],
    queryFn: async () => {
      const { data } = await supabase.from("shipments").select("id, code, container_no").eq("mode", "sea_fcl").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  async function update(id: string, patch: { status?: string; container_no?: string | null; shipment_id?: string | null }) {
    const { error } = await supabase.from("container_bookings").update(patch).eq("id", id);
    if (error) return toast.error("Could not save");
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["staff-container-bookings"] });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-navy">Container bookings (FCL)</h1>
        <p className="text-sm text-muted-foreground">Requests from the customer portal. Update the status and link the FCL shipment so the customer's tracking page fills in.</p>
      </div>
      {!rows?.length && <Card className="p-6 text-sm text-muted-foreground">No container bookings yet.</Card>}
      {rows?.map((r) => {
        const p = r.profiles as { full_name: string | null; phone: string | null; shipping_mark: string } | null;
        return (
          <Card key={r.id} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link to="/portal/containers/$code" params={{ code: r.code }} className="font-mono font-bold text-brand-navy hover:underline">{r.code}</Link>
                <div className="text-sm">{p?.full_name} · <span className="font-mono text-brand-orange">{p?.shipping_mark}</span> · {p?.phone}</div>
                <div className="text-sm text-muted-foreground">{r.quantity} × {SIZE_LABEL[r.container_size]} · {r.origin_city} → {r.delivery_city || "Ghana"} · {r.commodity}{r.cargo_ready_date ? ` · ready ${r.cargo_ready_date}` : ""}</div>
                {r.notes && <div className="mt-1 text-xs text-muted-foreground">Note: {r.notes}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <select aria-label="Status" defaultValue={r.status} onChange={(e) => update(r.id, { status: e.target.value })} className="h-9 rounded-md border bg-background px-2 text-sm">
                {[...BOOKING_STATUS, { key: "cancelled", label: "Cancelled" }].map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <select aria-label="Linked shipment" defaultValue={r.shipment_id ?? ""} onChange={(e) => update(r.id, { shipment_id: e.target.value || null })} className="h-9 rounded-md border bg-background px-2 text-sm">
                <option value="">No FCL shipment linked</option>
                {shipments?.map((s) => <option key={s.id} value={s.id}>{s.code}{s.container_no ? ` · ${s.container_no}` : ""}</option>)}
              </select>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get("c") as string; update(r.id, { container_no: v.trim() || null }); }}>
                <Input name="c" defaultValue={r.container_no ?? ""} placeholder="Container no." className="h-9" />
                <Button type="submit" size="sm" variant="outline">Save</Button>
              </form>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
