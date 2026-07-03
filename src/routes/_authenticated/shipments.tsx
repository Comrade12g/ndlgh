import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
import { Plus, Ship } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/shipments")({
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

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
                  <tr key={s.id} className="border-t hover:bg-muted/30">
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
      toast.success("Shipment created");
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
