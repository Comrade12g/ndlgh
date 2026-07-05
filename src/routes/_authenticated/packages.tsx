import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { openWhatsApp, waTemplates, copyToClipboard } from "@/lib/whatsapp";
import { Plus, Search, Package as PackageIcon, MessageCircle, Copy, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { ensureContactShadow } from "@/lib/ensureContactShadow";

export const Route = createFileRoute("/_authenticated/packages")({
  component: PackagesPage,
});

function PackagesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages", search],
    queryFn: async () => {
      let q = supabase
        .from("packages")
        .select(
          "id, tracking_code, shipping_mark, warehouse_code, description, weight_kg, cbm, pieces, status, received_at, customer_id",
        )
        .order("received_at", { ascending: false })
        .limit(200);
      if (search) q = q.or(`shipping_mark.ilike.%${search}%,tracking_code.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      const rows = data ?? [];
      const customerIds = Array.from(
        new Set(rows.map((r) => r.customer_id).filter(Boolean)),
      ) as string[];
      const { data: profiles } = customerIds.length
        ? await supabase.from("profiles").select("id, full_name, phone").in("id", customerIds)
        : { data: [] as { id: string; full_name: string | null; phone: string | null }[] };
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({
        ...r,
        customer: r.customer_id ? byId.get(r.customer_id) : undefined,
      }));
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Warehouse"
        title="Packages"
        description="Every parcel received at our overseas hubs. Weigh, measure, photograph, and consolidate into shipments."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <Plus className="mr-2 h-4 w-4" /> Intake package
              </Button>
            </DialogTrigger>
            <IntakePackageDialog
              onDone={() => {
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["packages"] });
              }}
            />
          </Dialog>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Shipping mark or tracking code…"
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !packages?.length ? (
          <EmptyState
            title="No packages yet"
            description="Intake your first parcel when it arrives at a warehouse."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Tracking</th>
                  <th className="px-4 py-3 text-left">Mark</th>
                  <th className="px-4 py-3 text-left">Hub</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Pcs</th>
                  <th className="px-4 py-3 text-right">Wt (kg)</th>
                  <th className="px-4 py-3 text-right">CBM</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-brand-navy">
                      {p.tracking_code}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-orange">
                      {p.shipping_mark ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-brand-navy/10 px-2 py-0.5 text-xs font-semibold text-brand-navy">
                        {p.warehouse_code ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{p.pieces}</td>
                    <td className="px-4 py-3 text-right">{Number(p.weight_kg).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{Number(p.cbm).toFixed(3)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone(p.status)}>
                        {p.status.replace("_", " ")}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-brand-navy hover:bg-brand-navy/10"
                          title="Edit package"
                          onClick={() => setEditId(p.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {p.customer?.phone && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-emerald-700 hover:bg-emerald-50"
                              title="Notify customer on WhatsApp"
                              onClick={() => {
                                const msg = waTemplates.packageReceived(
                                  p.customer?.full_name ?? "there",
                                  p.tracking_code,
                                  p.warehouse_code ?? "our",
                                );
                                if (!openWhatsApp(p.customer?.phone, msg))
                                  toast.error("No valid phone number on file");
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Copy message"
                              onClick={async () => {
                                const msg = waTemplates.packageReceived(
                                  p.customer?.full_name ?? "there",
                                  p.tracking_code,
                                  p.warehouse_code ?? "our",
                                );
                                if (await copyToClipboard(msg)) toast.success("Message copied");
                                else toast.error("Couldn't copy — check clipboard permissions");
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        {editId && (
          <EditPackageDialog
            id={editId}
            onDone={() => {
              setEditId(null);
              qc.invalidateQueries({ queryKey: ["packages"] });
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function IntakePackageDialog({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    shipping_mark: "",
    warehouse_code: "CN",
    supplier_name: "",
    description: "",
    pieces: 1,
    weight_kg: 0,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    external_tracking: "",
    notes: "",
    
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () => {
      const { data } = await supabase.from("warehouses").select("code, name").order("code");
      return data ?? [];
    },
  });

  const mut = useMutation({
    mutationFn: async () => {
      // Look up customer by shipping_mark
      let customer_id: string | null = null;
      if (form.shipping_mark) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .eq("shipping_mark", form.shipping_mark.trim().toUpperCase())
          .maybeSingle();
        customer_id = data?.id ?? null;
        // Workaround for a live-DB bug: customer_id FKs on several tables
        // wrongly point at contacts instead of profiles. Ensuring a
        // matching contacts row exists prevents the auto-invoice trigger
        // (which fires right after this insert) from failing. Safe to
        // remove once the DB constraint is fixed.
        if (customer_id) await ensureContactShadow(customer_id, data?.full_name, data?.phone);
      }
      const cbm = (form.length_cm * form.width_cm * form.height_cm) / 1_000_000;
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("packages").insert({
        customer_id,
        shipping_mark: form.shipping_mark.trim().toUpperCase() || null,
        warehouse_code: form.warehouse_code,
        supplier_name: form.supplier_name || null,
        description: form.description || null,
        pieces: form.pieces,
        weight_kg: form.weight_kg,
        length_cm: form.length_cm || null,
        width_cm: form.width_cm || null,
        height_cm: form.height_cm || null,
        cbm,
        external_tracking: form.external_tracking || null,
        notes: form.notes || null,
        received_by: u.user?.id,
        status: "received",
      });
      if (error) throw error;
      return { matched: !!customer_id };
    },
    onSuccess: (res) => {
      toast.success(
        res.matched
          ? "Package intaken and matched to customer"
          : "Package intaken (unmatched — no customer with that mark)",
      );
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const cbm = ((form.length_cm * form.width_cm * form.height_cm) / 1_000_000).toFixed(4);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <PackageIcon className="h-5 w-5 text-brand-orange" /> Intake package
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
          <div className="grid gap-2 col-span-2">
            <Label>Shipping mark</Label>
            <Input
              placeholder="NDL-GH-00001"
              value={form.shipping_mark}
              onChange={(e) => setForm({ ...form, shipping_mark: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Warehouse</Label>
            <Select
              value={form.warehouse_code}
              onValueChange={(v) => setForm({ ...form, warehouse_code: v })}
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

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Supplier / sender</Label>
            <Input
              value={form.supplier_name}
              onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>External tracking</Label>
            <Input
              value={form.external_tracking}
              onChange={(e) => setForm({ ...form, external_tracking: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="grid gap-2">
            <Label>Pieces</Label>
            <Input
              type="number"
              min="1"
              value={form.pieces}
              onChange={(e) => setForm({ ...form, pieces: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.weight_kg}
              onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2 col-span-2">
            <Label>L × W × H (cm)</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                placeholder="L"
                value={form.length_cm || ""}
                onChange={(e) => setForm({ ...form, length_cm: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="W"
                value={form.width_cm || ""}
                onChange={(e) => setForm({ ...form, width_cm: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="H"
                value={form.height_cm || ""}
                onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md bg-muted p-3 text-sm">
          Computed volume: <span className="font-mono font-bold text-brand-navy">{cbm} CBM</span>
        </div>

        <div className="grid gap-2">
          <Label>Notes</Label>
          <Textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : "Save intake"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EditPackageDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const { data: warehouses } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () =>
      (await supabase.from("warehouses").select("code, name").order("code")).data ?? [],
  });

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["package-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select(
          "id, tracking_code, shipping_mark, warehouse_code, supplier_name, description, pieces, weight_kg, length_cm, width_cm, height_cm, external_tracking, notes, rate_override, status",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<{
    shipping_mark: string;
    warehouse_code: string;
    supplier_name: string;
    description: string;
    pieces: number;
    weight_kg: number;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    external_tracking: string;
    notes: string;
    rate_override: string;
  } | null>(null);

  // Hydrate form once when data arrives
  if (pkg && !form) {
    setForm({
      shipping_mark: pkg.shipping_mark ?? "",
      warehouse_code: pkg.warehouse_code ?? "CN",
      supplier_name: pkg.supplier_name ?? "",
      description: pkg.description ?? "",
      pieces: pkg.pieces,
      weight_kg: Number(pkg.weight_kg),
      length_cm: Number(pkg.length_cm ?? 0),
      width_cm: Number(pkg.width_cm ?? 0),
      height_cm: Number(pkg.height_cm ?? 0),
      external_tracking: pkg.external_tracking ?? "",
      notes: pkg.notes ?? "",
      rate_override: pkg.rate_override != null ? String(pkg.rate_override) : "",
    });
  }

  const locked =
    pkg?.status === "delivered" || pkg?.status === "returned" || pkg?.status === "lost";

  const mut = useMutation({
    mutationFn: async () => {
      if (!form) return;
      // Re-match customer if shipping mark changed
      let customer_id: string | null | undefined = undefined;
      if (form.shipping_mark) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .eq("shipping_mark", form.shipping_mark.trim().toUpperCase())
          .maybeSingle();
        customer_id = data?.id ?? null;
        if (customer_id) await ensureContactShadow(customer_id, data?.full_name, data?.phone);
      }
      const cbm = (form.length_cm * form.width_cm * form.height_cm) / 1_000_000;
      const patch = {
        shipping_mark: form.shipping_mark.trim().toUpperCase() || null,
        warehouse_code: form.warehouse_code,
        supplier_name: form.supplier_name || null,
        description: form.description || null,
        pieces: form.pieces,
        weight_kg: form.weight_kg,
        length_cm: form.length_cm || null,
        width_cm: form.width_cm || null,
        height_cm: form.height_cm || null,
        cbm,
        external_tracking: form.external_tracking || null,
        notes: form.notes || null,
        rate_override: form.rate_override ? Number(form.rate_override) : null,
        ...(customer_id !== undefined ? { customer_id } : {}),
      };
      const { error } = await supabase.from("packages").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Package updated");
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading || !form) {
    return (
      <DialogContent className="max-w-2xl">
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      </DialogContent>
    );
  }

  const cbm = ((form.length_cm * form.width_cm * form.height_cm) / 1_000_000).toFixed(4);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <PackageIcon className="h-5 w-5 text-brand-orange" />
          Edit {pkg?.tracking_code}
        </DialogTitle>
      </DialogHeader>
      {locked && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
          This package is {pkg?.status}. Fields are read-only.
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-3"
      >
        <fieldset disabled={locked} className="grid gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2 col-span-2">
              <Label>Shipping mark</Label>
              <Input
                value={form.shipping_mark}
                onChange={(e) => setForm({ ...form, shipping_mark: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Warehouse</Label>
              <Select
                value={form.warehouse_code}
                onValueChange={(v) => setForm({ ...form, warehouse_code: v })}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Supplier / sender</Label>
              <Input
                value={form.supplier_name}
                onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>External tracking</Label>
              <Input
                value={form.external_tracking}
                onChange={(e) => setForm({ ...form, external_tracking: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="grid gap-2">
              <Label>Pieces</Label>
              <Input
                type="number"
                min="1"
                value={form.pieces}
                onChange={(e) => setForm({ ...form, pieces: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2 col-span-2">
              <Label>L × W × H (cm)</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="L"
                  value={form.length_cm || ""}
                  onChange={(e) => setForm({ ...form, length_cm: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="W"
                  value={form.width_cm || ""}
                  onChange={(e) => setForm({ ...form, width_cm: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="H"
                  value={form.height_cm || ""}
                  onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            Computed volume: <span className="font-mono font-bold text-brand-navy">{cbm} CBM</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Rate override (per unit)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Leave blank for rate card"
                value={form.rate_override}
                onChange={(e) => setForm({ ...form, rate_override: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </fieldset>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending || locked}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
