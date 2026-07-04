import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Ship, PackagePlus, Trash2, Search, Pencil, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/shipments")({
  component: ShipmentsPage,
});

type ShipmentStatus =
  | "planning"
  | "loading"
  | "departed"
  | "in_transit"
  | "arrived"
  | "clearing"
  | "cleared"
  | "closed"
  | "cancelled";

// Pipeline order — used to compute "next step" and to prevent skipping stages by accident.
const PIPELINE: ShipmentStatus[] = [
  "planning",
  "loading",
  "departed",
  "in_transit",
  "arrived",
  "clearing",
  "cleared",
  "closed",
];

function ShipmentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: shipments, isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select(
          "id, code, mode, origin_warehouse, destination_warehouse, status, etd, eta, total_cbm, total_weight_kg, container_no",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Freight"
        title="Shipments"
        description="Sea groupage, full containers, air freight, and intercity consolidations."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <Plus className="mr-2 h-4 w-4" /> New shipment
              </Button>
            </DialogTrigger>
            <NewShipmentDialog
              onDone={() => {
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["shipments"] });
              }}
            />
          </Dialog>
        }
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !shipments?.length ? (
          <EmptyState
            title="No shipments yet"
            description="Create your first consolidation to move packages to Ghana."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Mode</th>
                  <th className="px-4 py-3 text-left">Route</th>
                  <th className="px-4 py-3 text-left">Container / Ref</th>
                  <th className="px-4 py-3 text-left">ETD</th>
                  <th className="px-4 py-3 text-left">ETA</th>
                  <th className="px-4 py-3 text-right">CBM</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer border-t hover:bg-muted/30"
                    onClick={() => setDetailId(s.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-navy">
                      {s.code}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-brand-sky/10 px-2 py-0.5 text-xs font-semibold uppercase text-brand-sky">
                        {s.mode.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="font-semibold text-brand-navy">{s.origin_warehouse}</span>
                      <span className="mx-1">→</span>
                      <span className="font-semibold text-brand-navy">
                        {s.destination_warehouse}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.container_no ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.etd ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.eta ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{Number(s.total_cbm).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone(s.status)}>{s.status}</StatusBadge>
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
          <ShipmentDetailDialog
            id={detailId}
            onChanged={() => qc.invalidateQueries({ queryKey: ["shipments"] })}
          />
        )}
      </Dialog>
    </div>
  );
}

function NewShipmentDialog({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    mode: "sea_lcl" as "sea_lcl" | "sea_fcl" | "air" | "intercity",
    origin_warehouse: "CN",
    destination_warehouse: "GH",
    container_no: "",
    bol_no: "",
    vessel_or_flight: "",
    etd: "",
    eta: "",
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () =>
      (await supabase.from("warehouses").select("code, name").order("code")).data ?? [],
  });

  const mut = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("shipments").insert({
        ...form,
        etd: form.etd || null,
        eta: form.eta || null,
        container_no: form.container_no || null,
        bol_no: form.bol_no || null,
        vessel_or_flight: form.vessel_or_flight || null,
        created_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Shipment created — now load packages onto it");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5 text-brand-orange" /> New shipment
        </DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-3"
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label>Mode</Label>
            <Select
              value={form.mode}
              onValueChange={(v) => setForm({ ...form, mode: v as typeof form.mode })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sea_lcl">Sea LCL</SelectItem>
                <SelectItem value="sea_fcl">Sea FCL</SelectItem>
                <SelectItem value="air">Air</SelectItem>
                <SelectItem value="intercity">Intercity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Origin</Label>
            <Select
              value={form.origin_warehouse}
              onValueChange={(v) => setForm({ ...form, origin_warehouse: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Destination</Label>
            <Select
              value={form.destination_warehouse}
              onValueChange={(v) => setForm({ ...form, destination_warehouse: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Container / AWB</Label>
            <Input
              value={form.container_no}
              onChange={(e) => setForm({ ...form, container_no: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>BOL no.</Label>
            <Input
              value={form.bol_no}
              onChange={(e) => setForm({ ...form, bol_no: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Vessel / Flight</Label>
          <Input
            value={form.vessel_or_flight}
            onChange={(e) => setForm({ ...form, vessel_or_flight: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>ETD</Label>
            <Input
              type="date"
              value={form.etd}
              onChange={(e) => setForm({ ...form, etd: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>ETA</Label>
            <Input
              type="date"
              value={form.eta}
              onChange={(e) => setForm({ ...form, eta: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : "Create shipment"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/** Recomputes and persists a shipment's total_cbm / total_weight_kg from its currently-loaded packages. */
async function recomputeShipmentTotals(shipmentId: string) {
  const { data: links } = await supabase
    .from("shipment_packages")
    .select("package_id")
    .eq("shipment_id", shipmentId);
  const packageIds = (links ?? []).map((l) => l.package_id);
  let total_cbm = 0;
  let total_weight_kg = 0;
  if (packageIds.length) {
    const { data: pkgs } = await supabase
      .from("packages")
      .select("cbm, weight_kg")
      .in("id", packageIds);
    for (const p of pkgs ?? []) {
      total_cbm += Number(p.cbm ?? 0);
      total_weight_kg += Number(p.weight_kg ?? 0);
    }
  }
  await supabase.from("shipments").update({ total_cbm, total_weight_kg }).eq("id", shipmentId);
}

function ShipmentDetailDialog({ id, onChanged }: { id: string; onChanged: () => void }) {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data: shipment, isLoading } = useQuery({
    queryKey: ["shipment-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select(
          "id, code, mode, origin_warehouse, destination_warehouse, container_no, bol_no, vessel_or_flight, etd, eta, actual_departure, actual_arrival, status, total_cbm, total_weight_kg, freight_cost, freight_currency",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: loadedPackages } = useQuery({
    queryKey: ["shipment-packages", id],
    queryFn: async () => {
      const { data: links, error } = await supabase
        .from("shipment_packages")
        .select("package_id")
        .eq("shipment_id", id);
      if (error) throw error;
      const ids = (links ?? []).map((l) => l.package_id);
      if (!ids.length) return [];
      const { data } = await supabase
        .from("packages")
        .select("id, tracking_code, shipping_mark, description, weight_kg, cbm, status")
        .in("id", ids);
      return data ?? [];
    },
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["shipment-detail", id] });
    qc.invalidateQueries({ queryKey: ["shipment-packages", id] });
    onChanged();
  };

  const removePackage = useMutation({
    mutationFn: async (packageId: string) => {
      const { error } = await supabase
        .from("shipment_packages")
        .delete()
        .eq("shipment_id", id)
        .eq("package_id", packageId);
      if (error) throw error;
      await supabase.from("packages").update({ status: "received" }).eq("id", packageId);
      await recomputeShipmentTotals(id);
    },
    onSuccess: () => {
      toast.success("Package removed from shipment");
      invalidateAll();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const advanceStatus = useMutation({
    mutationFn: async (next: ShipmentStatus) => {
      const patch: { status: ShipmentStatus; actual_departure?: string; actual_arrival?: string } =
        { status: next };
      if (next === "departed") patch.actual_departure = new Date().toISOString().slice(0, 10);
      if (next === "arrived") patch.actual_arrival = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("shipments").update(patch).eq("id", id);
      if (error) throw error;

      // Cascade package status with the shipment's lifecycle
      const packageStatus =
        next === "departed" ? "in_transit" : next === "arrived" ? "arrived_gh" : null;
      if (packageStatus && loadedPackages?.length) {
        await supabase
          .from("packages")
          .update({ status: packageStatus })
          .in(
            "id",
            loadedPackages.map((p) => p.id),
          );
      }
    },
    onSuccess: () => {
      toast.success("Shipment updated");
      invalidateAll();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading || !shipment) {
    return (
      <DialogContent className="max-w-2xl">
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      </DialogContent>
    );
  }

  const canEditLoad = shipment.status === "planning" || shipment.status === "loading";
  const stepIdx = PIPELINE.indexOf(shipment.status as ShipmentStatus);
  const nextStep = stepIdx >= 0 ? PIPELINE[stepIdx + 1] : undefined;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-2 pr-6">
          <span className="font-mono">{shipment.code}</span>
          <StatusBadge tone={statusTone(shipment.status)}>{shipment.status}</StatusBadge>
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Route</div>
            <div className="font-semibold text-brand-navy">
              {shipment.origin_warehouse} → {shipment.destination_warehouse}
            </div>
            <div className="text-muted-foreground">
              {shipment.mode.replace("_", " ")}{" "}
              {shipment.container_no ? `· ${shipment.container_no}` : ""}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Schedule</div>
            <div>
              ETD {shipment.etd ?? "—"}{" "}
              {shipment.actual_departure ? `(actual ${shipment.actual_departure})` : ""}
            </div>
            <div className="text-muted-foreground">
              ETA {shipment.eta ?? "—"}{" "}
              {shipment.actual_arrival ? `(actual ${shipment.actual_arrival})` : ""}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-md bg-muted p-3">
          <div>
            <div className="text-xs text-muted-foreground">Total CBM</div>
            <div className="font-bold">{Number(shipment.total_cbm).toFixed(3)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total weight</div>
            <div className="font-bold">{Number(shipment.total_weight_kg).toFixed(1)} kg</div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Loaded packages ({loadedPackages?.length ?? 0})
            </div>
            {canEditLoad && (
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <PackagePlus className="mr-1 h-3 w-3" /> Add packages
                  </Button>
                </DialogTrigger>
                <AddPackagesDialog
                  shipmentId={id}
                  originWarehouse={shipment.origin_warehouse}
                  onDone={() => {
                    setAddOpen(false);
                    invalidateAll();
                  }}
                />
              </Dialog>
            )}
          </div>
          {!loadedPackages?.length ? (
            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              No packages loaded yet.
            </div>
          ) : (
            <div className="rounded-md border">
              {loadedPackages.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b px-3 py-2 text-sm last:border-b-0"
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-brand-navy">
                      {p.tracking_code}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.shipping_mark ?? "unmatched"} · {Number(p.weight_kg).toFixed(1)}kg ·{" "}
                      {Number(p.cbm).toFixed(3)} CBM
                    </div>
                  </div>
                  {canEditLoad && (
                    <Button size="icon" variant="ghost" onClick={() => removePackage.mutate(p.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          {shipment.status !== "cancelled" && shipment.status !== "closed" && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => advanceStatus.mutate("cancelled")}
            >
              Cancel shipment
            </Button>
          )}
          {nextStep && shipment.status !== "cancelled" && (
            <Button
              size="sm"
              className="bg-brand-orange hover:bg-brand-orange/90"
              disabled={nextStep === "departed" && !loadedPackages?.length}
              onClick={() => advanceStatus.mutate(nextStep)}
              title={
                nextStep === "departed" && !loadedPackages?.length
                  ? "Load at least one package first"
                  : undefined
              }
            >
              Mark as {nextStep.replace("_", " ")}
            </Button>
          )}
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

function AddPackagesDialog({
  shipmentId,
  originWarehouse,
  onDone,
}: {
  shipmentId: string;
  originWarehouse: string | null;
  onDone: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: available, isLoading } = useQuery({
    queryKey: ["loadable-packages", originWarehouse, search],
    queryFn: async () => {
      // Packages already on ANY shipment must be excluded
      const { data: linked } = await supabase.from("shipment_packages").select("package_id");
      const linkedIds = new Set((linked ?? []).map((l) => l.package_id));

      let q = supabase
        .from("packages")
        .select("id, tracking_code, shipping_mark, description, weight_kg, cbm, status")
        .in("status", ["received", "weighed"])
        .order("received_at", { ascending: false })
        .limit(300);
      if (originWarehouse) q = q.eq("warehouse_code", originWarehouse);
      if (search) q = q.or(`tracking_code.ilike.%${search}%,shipping_mark.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).filter((p) => !linkedIds.has(p.id));
    },
  });

  const mut = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selected);
      if (!ids.length) throw new Error("Select at least one package");
      const { error } = await supabase
        .from("shipment_packages")
        .insert(ids.map((package_id) => ({ shipment_id: shipmentId, package_id })));
      if (error) throw error;
      await supabase.from("packages").update({ status: "loaded" }).in("id", ids);
      await recomputeShipmentTotals(shipmentId);
    },
    onSuccess: () => {
      toast.success(`${selected.size} package(s) loaded`);
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add packages to shipment</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tracking code or shipping mark…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-80 overflow-y-auto rounded-md border">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : !available?.length ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No unloaded packages{originWarehouse ? ` at ${originWarehouse}` : ""}.
            </div>
          ) : (
            available.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/40"
              >
                <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                <div className="flex-1">
                  <div className="font-mono text-xs font-semibold text-brand-navy">
                    {p.tracking_code}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.shipping_mark ?? "unmatched"} · {p.description ?? ""} ·{" "}
                    {Number(p.weight_kg).toFixed(1)}kg · {Number(p.cbm).toFixed(3)} CBM
                  </div>
                </div>
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
            {mut.isPending ? "Loading…" : `Load ${selected.size || ""} package(s)`}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
