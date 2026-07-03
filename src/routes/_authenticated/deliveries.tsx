import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/deliveries")({
  component: DeliveriesPage,
});

type DeliveryStatus = "scheduled" | "out_for_delivery" | "delivered" | "failed" | "cancelled";

function DeliveriesPage() {
  const qc = useQueryClient();
  const [newOpen, setNewOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select(
          "id, code, recipient_name, recipient_phone, city, region, scheduled_for, status, fee_amount, fee_currency, delivered_at, driver_id",
        )
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
        actions={
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <Plus className="mr-2 h-4 w-4" /> Book delivery
              </Button>
            </DialogTrigger>
            <NewDeliveryDialog
              onDone={() => {
                setNewOpen(false);
                qc.invalidateQueries({ queryKey: ["deliveries"] });
              }}
            />
          </Dialog>
        }
      />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !data?.length ? (
          <EmptyState
            title="No deliveries scheduled"
            description="Deliveries appear here as shipments arrive and get booked for last-mile."
          />
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
                  <tr
                    key={d.id}
                    className="cursor-pointer border-t hover:bg-muted/30"
                    onClick={() => setDetailId(d.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-navy">
                      {d.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-navy">{d.recipient_name}</div>
                      <div className="text-xs text-muted-foreground">{d.recipient_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.city}
                      {d.region ? `, ${d.region}` : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.scheduled_for ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {d.fee_amount ? `${d.fee_currency} ${Number(d.fee_amount).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone(d.status)}>
                        {d.status.replace("_", " ")}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        {detailId && (
          <DeliveryDetailDialog
            id={detailId}
            onChanged={() => qc.invalidateQueries({ queryKey: ["deliveries"] })}
          />
        )}
      </Dialog>
    </div>
  );
}

function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "driver");
      if (error) throw error;
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", ids);
      return profiles ?? [];
    },
  });
}

function NewDeliveryDialog({ onDone }: { onDone: () => void }) {
  const { data: drivers } = useDrivers();
  const [form, setForm] = useState({
    recipient_name: "",
    recipient_phone: "",
    address_line1: "",
    address_line2: "",
    city: "Accra",
    region: "",
    scheduled_for: "",
    fee_amount: 0,
    fee_currency: "GHS",
    driver_id: "",
    notes: "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("deliveries").insert({
        recipient_name: form.recipient_name,
        recipient_phone: form.recipient_phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: form.city,
        region: form.region || null,
        scheduled_for: form.scheduled_for || null,
        fee_amount: form.fee_amount || 0,
        fee_currency: form.fee_currency,
        driver_id: form.driver_id || null,
        notes: form.notes || null,
        status: "scheduled",
        created_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Delivery booked");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-brand-orange" /> Book delivery
        </DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Recipient name</Label>
            <Input
              required
              value={form.recipient_name}
              onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Recipient phone</Label>
            <Input
              required
              value={form.recipient_phone}
              onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Address</Label>
          <Input
            required
            placeholder="House/street address"
            value={form.address_line1}
            onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
          />
          <Input
            placeholder="Landmark / additional info (optional)"
            value={form.address_line2}
            onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>City</Label>
            <Input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Region</Label>
            <Input
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label>Scheduled for</Label>
            <Input
              type="date"
              value={form.scheduled_for}
              onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Fee</Label>
            <Input
              type="number"
              step="0.01"
              value={form.fee_amount}
              onChange={(e) => setForm({ ...form, fee_amount: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select
              value={form.fee_currency}
              onValueChange={(v) => setForm({ ...form, fee_currency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GHS">GHS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Assign driver (optional)</Label>
          <Select value={form.driver_id} onValueChange={(v) => setForm({ ...form, driver_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {drivers?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.full_name ?? d.phone ?? d.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!drivers?.length && (
            <div className="text-xs text-muted-foreground">
              No drivers assigned yet — add the "Driver" role under Admin → Users & roles.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Booking…" : "Book delivery"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function DeliveryDetailDialog({ id, onChanged }: { id: string; onChanged: () => void }) {
  const qc = useQueryClient();
  const { data: drivers } = useDrivers();

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["delivery-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select(
          "id, code, recipient_name, recipient_phone, address_line1, address_line2, city, region, status, driver_id, scheduled_for, fee_amount, fee_currency, delivered_at, pod_signed_by, notes",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const updateMut = useMutation({
    mutationFn: async (patch: {
      status?: DeliveryStatus;
      delivered_at?: string;
      driver_id?: string | null;
      pod_signed_by?: string | null;
    }) => {
      const { error } = await supabase.from("deliveries").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Delivery updated");
      qc.invalidateQueries({ queryKey: ["delivery-detail", id] });
      onChanged();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading || !delivery) {
    return (
      <DialogContent className="max-w-lg">
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-2 pr-6">
          <span className="font-mono">{delivery.code}</span>
          <StatusBadge tone={statusTone(delivery.status)}>
            {delivery.status.replace("_", " ")}
          </StatusBadge>
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 text-sm">
        <div>
          <div className="font-semibold text-brand-navy">{delivery.recipient_name}</div>
          <div className="text-muted-foreground">{delivery.recipient_phone}</div>
          <div className="mt-1 text-muted-foreground">
            {delivery.address_line1}
            {delivery.address_line2 ? `, ${delivery.address_line2}` : ""}, {delivery.city}
            {delivery.region ? `, ${delivery.region}` : ""}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={delivery.status}
            onValueChange={(v) =>
              updateMut.mutate(
                v === "delivered"
                  ? { status: v as DeliveryStatus, delivered_at: new Date().toISOString() }
                  : { status: v as DeliveryStatus },
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Driver</Label>
          <Select
            value={delivery.driver_id ?? ""}
            onValueChange={(v) => updateMut.mutate({ driver_id: v || null })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {drivers?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.full_name ?? d.phone ?? d.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {delivery.status === "delivered" && (
          <div className="grid gap-2">
            <Label>Signed by (POD)</Label>
            <Input
              defaultValue={delivery.pod_signed_by ?? ""}
              placeholder="Name of person who received the package"
              onBlur={(e) =>
                e.target.value !== (delivery.pod_signed_by ?? "") &&
                updateMut.mutate({ pod_signed_by: e.target.value || null })
              }
            />
            <div className="text-xs text-muted-foreground">
              Photo/signature upload will come with file storage — record the name for now.
            </div>
          </div>
        )}

        {delivery.fee_amount ? (
          <div className="text-muted-foreground">
            Fee:{" "}
            <span className="font-semibold text-foreground">
              {delivery.fee_currency} {Number(delivery.fee_amount).toFixed(2)}
            </span>
          </div>
        ) : null}
      </div>
    </DialogContent>
  );
}
