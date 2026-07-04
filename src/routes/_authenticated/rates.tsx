import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { PageHeader, EmptyState } from "@/components/ops/PageHeader";
import { Plus, Tags } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/rates")({
  component: RatesPage,
});

type ShipmentMode = "sea_lcl" | "sea_fcl" | "air" | "intercity";

const MODE_LABEL: Record<ShipmentMode, string> = {
  sea_lcl: "Sea LCL",
  sea_fcl: "Sea FCL",
  air: "Air",
  intercity: "Intercity",
};

const MODE_DEFAULT_UNIT: Record<ShipmentMode, string> = {
  sea_lcl: "CBM",
  sea_fcl: "container_20ft",
  air: "KG",
  intercity: "flat",
};

function RatesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const { data: rates, isLoading } = useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rates")
        .select(
          "id, origin_code, destination_code, mode, unit, price, currency, min_qty, effective_from, active, notes",
        )
        .order("active", { ascending: false })
        .order("origin_code");
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("rates").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rate updated");
      qc.invalidateQueries({ queryKey: ["rates"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Pricing"
        title="Rates"
        description="Freight pricing by route, mode, and unit. These power invoice auto-fill so quotes stay consistent."
        actions={
          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-brand-orange hover:bg-brand-orange/90"
                onClick={() => setEditing(null)}
              >
                <Plus className="mr-2 h-4 w-4" /> New rate
              </Button>
            </DialogTrigger>
            <RateFormDialog
              id={editing}
              onDone={() => {
                setOpen(false);
                setEditing(null);
                qc.invalidateQueries({ queryKey: ["rates"] });
              }}
            />
          </Dialog>
        }
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !rates?.length ? (
          <EmptyState
            title="No rates yet"
            description="Add your first route rate — e.g. CN → GH, Sea LCL, $360/CBM, 1 CBM minimum."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Route</th>
                  <th className="px-4 py-3 text-left">Mode</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Min qty</th>
                  <th className="px-4 py-3 text-left">Effective</th>
                  <th className="px-4 py-3 text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-t hover:bg-muted/30"
                    onClick={() => {
                      setEditing(r.id);
                      setOpen(true);
                    }}
                  >
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      {r.origin_code} → {r.destination_code}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-brand-sky/10 px-2 py-0.5 text-xs font-semibold uppercase text-brand-sky">
                        {MODE_LABEL[r.mode as ShipmentMode] ?? r.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.unit}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {r.currency} {Number(r.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {r.min_qty ? Number(r.min_qty).toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.effective_from}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={r.active}
                        onCheckedChange={(v) => toggleActive.mutate({ id: r.id, active: v })}
                      />
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

function RateFormDialog({ id, onDone }: { id: string | null; onDone: () => void }) {
  const { data: existing } = useQuery({
    queryKey: ["rate-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rates")
        .select("*")
        .eq("id", id as string)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () =>
      (await supabase.from("warehouses").select("code, name").order("code")).data ?? [],
  });

  const [form, setForm] = useState(() => ({
    origin_code: existing?.origin_code ?? "CN",
    destination_code: existing?.destination_code ?? "GH",
    mode: (existing?.mode ?? "sea_lcl") as ShipmentMode,
    unit: existing?.unit ?? "CBM",
    price: existing?.price ?? 0,
    currency: existing?.currency ?? "USD",
    min_qty: existing?.min_qty ?? 1,
    effective_from: existing?.effective_from ?? new Date().toISOString().slice(0, 10),
    notes: existing?.notes ?? "",
  }));

  // Re-sync form once the existing rate loads (dialog opens before the query resolves)
  useEffect(() => {
    if (existing) {
      setForm({
        origin_code: existing.origin_code ?? "CN",
        destination_code: existing.destination_code ?? "GH",
        mode: existing.mode as ShipmentMode,
        unit: existing.unit,
        price: existing.price,
        currency: existing.currency,
        min_qty: existing.min_qty ?? 1,
        effective_from: existing.effective_from,
        notes: existing.notes ?? "",
      });
    }
  }, [existing]);

  const mut = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const payload = {
        origin_code: form.origin_code,
        destination_code: form.destination_code,
        mode: form.mode,
        unit: form.unit,
        price: form.price,
        currency: form.currency,
        min_qty: form.min_qty || null,
        effective_from: form.effective_from,
        notes: form.notes || null,
      };
      if (id) {
        const { error } = await supabase.from("rates").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("rates")
          .insert({ ...payload, created_by: u.user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(id ? "Rate updated" : "Rate created");
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-brand-orange" /> {id ? "Edit rate" : "New rate"}
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
            <Label>Origin</Label>
            <Select
              value={form.origin_code}
              onValueChange={(v) => setForm({ ...form, origin_code: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.code} — {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Destination</Label>
            <Select
              value={form.destination_code}
              onValueChange={(v) => setForm({ ...form, destination_code: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.code} value={w.code}>
                    {w.code} — {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Mode</Label>
          <Select
            value={form.mode}
            onValueChange={(v) =>
              setForm({
                ...form,
                mode: v as ShipmentMode,
                unit: MODE_DEFAULT_UNIT[v as ShipmentMode],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MODE_LABEL) as ShipmentMode[]).map((m) => (
                <SelectItem key={m} value={m}>
                  {MODE_LABEL[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Unit</Label>
            <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CBM">Per CBM</SelectItem>
                <SelectItem value="KG">Per kg</SelectItem>
                <SelectItem value="container_20ft">Per 20ft container</SelectItem>
                <SelectItem value="container_40ft">Per 40ft container</SelectItem>
                <SelectItem value="flat">Flat rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GHS">GHS</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>
              Minimum qty{" "}
              {form.unit === "CBM" || form.unit === "KG" ? "(recommended)" : "(usually blank)"}
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.min_qty}
              onChange={(e) => setForm({ ...form, min_qty: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Effective from</Label>
          <Input
            type="date"
            value={form.effective_from}
            onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <Label>Notes</Label>
          <Textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. excludes local handling & customs"
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : id ? "Save changes" : "Create rate"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
