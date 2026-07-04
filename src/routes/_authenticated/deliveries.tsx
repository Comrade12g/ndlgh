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
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { openWhatsApp, waTemplates, copyToClipboard } from "@/lib/whatsapp";
import { Plus, Truck, MessageCircle, PackagePlus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { ensureContactShadow } from "@/lib/ensureContactShadow";

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

function useArrivedPackages(customerId: string) {
  return useQuery({
    queryKey: ["arrived-packages", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data: linked } = await supabase.from("delivery_packages").select("package_id");
      const linkedIds = new Set((linked ?? []).map((l) => l.package_id));
      const { data, error } = await supabase
        .from("packages")
        .select("id, tracking_code, shipping_mark, description, weight_kg, cbm")
        .eq("customer_id", customerId)
        .eq("status", "arrived_gh");
      if (error) throw error;
      return (data ?? []).filter((p) => !linkedIds.has(p.id));
    },
  });
}

function NewDeliveryDialog({ onDone }: { onDone: () => void }) {
  const { data: drivers } = useDrivers();
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
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

  const { data: customers } = useQuery({
    queryKey: ["profiles-search-delivery", customerSearch],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("id, full_name, phone, shipping_mark")
        .order("created_at", { ascending: false })
        .limit(50);
      if (customerSearch)
        q = q.or(
          `full_name.ilike.%${customerSearch}%,shipping_mark.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%`,
        );
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: arrivedPackages } = useArrivedPackages(customerId);

  function toggle(id: string) {
    setSelectedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const mut = useMutation({
    mutationFn: async () => {
      // Workaround for a live-DB bug: deliveries.customer_id FK wrongly
      // points at contacts instead of profiles. Remove once fixed at the DB level.
      if (customerId) {
        const selectedCustomer = customers?.find((c) => c.id === customerId);
        await ensureContactShadow(customerId, selectedCustomer?.full_name, selectedCustomer?.phone);
      }

      const { data: u } = await supabase.auth.getUser();
      const { data: delivery, error } = await supabase
        .from("deliveries")
        .insert({
          customer_id: customerId || null,
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
        })
        .select("id")
        .single();
      if (error) throw error;

      const ids = Array.from(selectedPackages);
      if (ids.length) {
        await supabase
          .from("delivery_packages")
          .insert(ids.map((package_id) => ({ delivery_id: delivery.id, package_id })));
        await supabase.from("packages").update({ status: "ready_delivery" }).in("id", ids);
      }
    },
    onSuccess: () => {
      toast.success("Delivery booked");
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
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
        <div className="grid gap-2">
          <Label>
            Customer (optional — links this delivery to their portal & lets you attach packages)
          </Label>
          <Input
            placeholder="Search by name, shipping mark, or phone…"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          <Select
            value={customerId}
            onValueChange={(v) => {
              setCustomerId(v);
              setSelectedPackages(new Set());
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="No customer linked" />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.full_name ?? "Unnamed"} — {c.shipping_mark} {c.phone ? `(${c.phone})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {customerId && (
          <div className="grid gap-2">
            <Label>Attach arrived packages (optional)</Label>
            <div className="max-h-40 overflow-y-auto rounded-md border">
              {!arrivedPackages?.length ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No unassigned arrived packages for this customer.
                </div>
              ) : (
                arrivedPackages.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-xs last:border-b-0 hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={selectedPackages.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                    />
                    <span className="font-mono font-semibold text-brand-navy">
                      {p.tracking_code}
                    </span>
                    <span className="text-muted-foreground">
                      {p.description ?? ""} · {Number(p.weight_kg).toFixed(1)}kg
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

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
  const [addOpen, setAddOpen] = useState(false);

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["delivery-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deliveries")
        .select(
          "id, code, recipient_name, recipient_phone, address_line1, address_line2, city, region, status, driver_id, customer_id, scheduled_for, fee_amount, fee_currency, delivered_at, pod_signed_by, notes",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: linkedPackages } = useQuery({
    queryKey: ["delivery-linked-packages", id],
    queryFn: async () => {
      const { data: links, error } = await supabase
        .from("delivery_packages")
        .select("package_id")
        .eq("delivery_id", id);
      if (error) throw error;
      const ids = (links ?? []).map((l) => l.package_id);
      if (!ids.length) return [];
      const { data } = await supabase
        .from("packages")
        .select("id, tracking_code, description, weight_kg, cbm")
        .in("id", ids);
      return data ?? [];
    },
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["delivery-detail", id] });
    qc.invalidateQueries({ queryKey: ["delivery-linked-packages", id] });
    onChanged();
  };

  const removePackage = useMutation({
    mutationFn: async (packageId: string) => {
      const { error } = await supabase
        .from("delivery_packages")
        .delete()
        .eq("delivery_id", id)
        .eq("package_id", packageId);
      if (error) throw error;
      await supabase.from("packages").update({ status: "arrived_gh" }).eq("id", packageId);
    },
    onSuccess: () => {
      toast.success("Package removed from delivery");
      invalidateAll();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
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

      // Cascade to the packages riding on this delivery
      if (patch.status && linkedPackages?.length) {
        const packageIds = linkedPackages.map((p) => p.id);
        if (patch.status === "delivered") {
          await supabase.from("packages").update({ status: "delivered" }).in("id", packageIds);
        } else if (patch.status === "cancelled" || patch.status === "failed") {
          await supabase.from("packages").update({ status: "arrived_gh" }).in("id", packageIds);
        } else if (patch.status === "out_for_delivery") {
          await supabase.from("packages").update({ status: "ready_delivery" }).in("id", packageIds);
        }
      }
    },
    onSuccess: () => {
      toast.success("Delivery updated");
      invalidateAll();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Packages on this delivery ({linkedPackages?.length ?? 0})</Label>
            {delivery.customer_id &&
              delivery.status !== "delivered" &&
              delivery.status !== "cancelled" && (
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <PackagePlus className="mr-1 h-3 w-3" /> Add packages
                    </Button>
                  </DialogTrigger>
                  <AddPackagesToDeliveryDialog
                    deliveryId={id}
                    customerId={delivery.customer_id}
                    onDone={() => {
                      setAddOpen(false);
                      invalidateAll();
                    }}
                  />
                </Dialog>
              )}
          </div>
          {!linkedPackages?.length ? (
            <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
              {delivery.customer_id
                ? "No packages attached yet."
                : "No customer linked — this is a manual delivery not tied to warehouse packages."}
            </div>
          ) : (
            <div className="rounded-md border">
              {linkedPackages.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b px-3 py-2 text-xs last:border-b-0"
                >
                  <div>
                    <span className="font-mono font-semibold text-brand-navy">
                      {p.tracking_code}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {p.description ?? ""} · {Number(p.weight_kg).toFixed(1)}kg
                    </span>
                  </div>
                  {delivery.status !== "delivered" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => removePackage.mutate(p.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            onClick={() => {
              const msg =
                delivery.status === "delivered"
                  ? waTemplates.deliveryDelivered(delivery.recipient_name, delivery.code)
                  : delivery.status === "out_for_delivery"
                    ? waTemplates.deliveryOutForDelivery(delivery.recipient_name, delivery.code)
                    : delivery.status === "failed"
                      ? waTemplates.deliveryFailed(delivery.recipient_name, delivery.code)
                      : waTemplates.deliveryScheduled(
                          delivery.recipient_name,
                          delivery.code,
                          delivery.city,
                          delivery.scheduled_for,
                        );
              if (!openWhatsApp(delivery.recipient_phone, msg))
                toast.error("No valid phone number on file");
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Notify customer on WhatsApp
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            title="Copy message (use this if WhatsApp Web won't refresh an already-open chat)"
            onClick={async () => {
              const msg =
                delivery.status === "delivered"
                  ? waTemplates.deliveryDelivered(delivery.recipient_name, delivery.code)
                  : delivery.status === "out_for_delivery"
                    ? waTemplates.deliveryOutForDelivery(delivery.recipient_name, delivery.code)
                    : delivery.status === "failed"
                      ? waTemplates.deliveryFailed(delivery.recipient_name, delivery.code)
                      : waTemplates.deliveryScheduled(
                          delivery.recipient_name,
                          delivery.code,
                          delivery.city,
                          delivery.scheduled_for,
                        );
              if (await copyToClipboard(msg))
                toast.success("Message copied — paste it into the chat");
              else toast.error("Couldn't copy — check clipboard permissions");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function AddPackagesToDeliveryDialog({
  deliveryId,
  customerId,
  onDone,
}: {
  deliveryId: string;
  customerId: string;
  onDone: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: arrivedPackages, isLoading } = useArrivedPackages(customerId);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const mut = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      if (!ids.length) throw new Error("Select at least one package");
      const { error } = await supabase
        .from("delivery_packages")
        .insert(ids.map((package_id) => ({ delivery_id: deliveryId, package_id })));
      if (error) throw error;
      await supabase.from("packages").update({ status: "ready_delivery" }).in("id", ids);
    },
    onSuccess: () => {
      toast.success(`${selected.size} package(s) attached`);
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Attach packages</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="max-h-72 overflow-y-auto rounded-md border">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading…</div>
          ) : !arrivedPackages?.length ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No unassigned arrived packages for this customer.
            </div>
          ) : (
            arrivedPackages.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-xs last:border-b-0 hover:bg-muted/40"
              >
                <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                <span className="font-mono font-semibold text-brand-navy">{p.tracking_code}</span>
                <span className="text-muted-foreground">
                  {p.description ?? ""} · {Number(p.weight_kg).toFixed(1)}kg
                </span>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending || !selected.size}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Attaching…" : `Attach ${selected.size || ""} package(s)`}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
