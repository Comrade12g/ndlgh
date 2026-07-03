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
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sourcing/pos")({
  component: SourcingPage,
});

type PoStatus = "draft" | "ordered" | "paid" | "shipped" | "received" | "cancelled";

function SourcingPage() {
  const qc = useQueryClient();
  const [newOpen, setNewOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(
          "id, code, description, quantity, currency, supplier_cost, margin_amount, sell_price, status, proof_url, ordered_at, agent_id, customer_id, supplier_id",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const rows = data ?? [];
      const supplierIds = Array.from(
        new Set(rows.map((r) => r.supplier_id).filter(Boolean)),
      ) as string[];
      const { data: suppliers } = supplierIds.length
        ? await supabase.from("suppliers").select("id, name").in("id", supplierIds)
        : { data: [] as { id: string; name: string }[] };
      const byId = new Map((suppliers ?? []).map((s) => [s.id, s]));
      return rows.map((r) => ({
        ...r,
        supplier: r.supplier_id ? byId.get(r.supplier_id) : undefined,
      }));
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Sourcing · Internal"
        title="Purchase Orders"
        description="Agent-led POs to overseas suppliers. Track supplier cost, our margin, sell price, and payment proof. Not visible to customers."
        actions={
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <Plus className="mr-2 h-4 w-4" /> New PO
              </Button>
            </DialogTrigger>
            <NewPoDialog
              onDone={() => {
                setNewOpen(false);
                qc.invalidateQueries({ queryKey: ["purchase-orders"] });
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
            title="No purchase orders"
            description="Agents create POs when they source goods on behalf of customers. Each one records supplier cost, margin, and proof."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Margin</th>
                  <th className="px-4 py-3 text-right">Sell price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((po) => (
                  <tr
                    key={po.id}
                    className="cursor-pointer border-t hover:bg-muted/30"
                    onClick={() => setDetailId(po.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-navy">
                      {po.code}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{po.supplier?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{po.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {po.currency} {Number(po.supplier_cost).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-orange">
                      {po.currency} {Number(po.margin_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-navy">
                      {po.currency} {Number(po.sell_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone(po.status)}>{po.status}</StatusBadge>
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
          <PoDetailDialog
            id={detailId}
            onChanged={() => qc.invalidateQueries({ queryKey: ["purchase-orders"] })}
          />
        )}
      </Dialog>
    </div>
  );
}

function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name, country")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function NewPoDialog({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const { data: suppliers } = useSuppliers();
  const [supplierId, setSupplierId] = useState("");
  const [quickSupplierOpen, setQuickSupplierOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    quantity: 1,
    currency: "USD",
    supplier_cost: 0,
    margin_amount: 0,
    proof_url: "",
  });

  const sellPrice = form.supplier_cost + form.margin_amount;

  const mut = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error("Select or add a supplier");
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("purchase_orders").insert({
        supplier_id: supplierId,
        description: form.description || null,
        quantity: form.quantity,
        currency: form.currency,
        supplier_cost: form.supplier_cost,
        margin_amount: form.margin_amount,
        sell_price: sellPrice,
        proof_url: form.proof_url || null,
        status: "draft",
        agent_id: u.user?.id,
        created_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Purchase order created");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-brand-orange" /> New purchase order
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
          <div className="flex items-center justify-between">
            <Label>Supplier</Label>
            <Dialog open={quickSupplierOpen} onOpenChange={setQuickSupplierOpen}>
              <DialogTrigger asChild>
                <Button type="button" size="sm" variant="outline">
                  + Add supplier
                </Button>
              </DialogTrigger>
              <QuickSupplierDialog
                onDone={(id) => {
                  setQuickSupplierOpen(false);
                  qc.invalidateQueries({ queryKey: ["suppliers-all"] });
                  setSupplierId(id);
                }}
              />
            </Dialog>
          </div>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier…" />
            </SelectTrigger>
            <SelectContent>
              {suppliers?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.country ? `(${s.country})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What's being sourced"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
                <SelectItem value="GHS">GHS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Proof URL</Label>
            <Input
              value={form.proof_url}
              onChange={(e) => setForm({ ...form, proof_url: e.target.value })}
              placeholder="Receipt link"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Supplier cost</Label>
            <Input
              type="number"
              step="0.01"
              value={form.supplier_cost}
              onChange={(e) => setForm({ ...form, supplier_cost: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Our margin</Label>
            <Input
              type="number"
              step="0.01"
              value={form.margin_amount}
              onChange={(e) => setForm({ ...form, margin_amount: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="rounded-md bg-muted p-3 text-right text-sm">
          Sell price:{" "}
          <span className="font-display text-lg font-extrabold text-brand-navy">
            {form.currency} {sellPrice.toFixed(2)}
          </span>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Creating…" : "Create PO"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function QuickSupplierDialog({ onDone }: { onDone: (id: string) => void }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("China");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          name,
          country,
          contact_name: contactName || null,
          phone: phone || null,
          created_by: u.user?.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      toast.success("Supplier added");
      onDone(d.id);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Add supplier</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-3"
      >
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Country</Label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Contact name</Label>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Phone / WeChat</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : "Add supplier"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function PoDetailDialog({ id, onChanged }: { id: string; onChanged: () => void }) {
  const qc = useQueryClient();

  const { data: po, isLoading } = useQuery({
    queryKey: ["po-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(
          "id, code, description, quantity, currency, supplier_cost, margin_amount, sell_price, status, proof_url, ordered_at, received_at, supplier_id",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      const { data: supplier } = data.supplier_id
        ? await supabase
            .from("suppliers")
            .select("name, country, contact_name, phone")
            .eq("id", data.supplier_id)
            .maybeSingle()
        : { data: null };
      return { ...data, supplier };
    },
  });

  const setStatus = useMutation({
    mutationFn: async (status: PoStatus) => {
      const patch: { status: PoStatus; ordered_at?: string; received_at?: string } = { status };
      if (status === "ordered") patch.ordered_at = new Date().toISOString();
      if (status === "received") patch.received_at = new Date().toISOString();
      const { error } = await supabase.from("purchase_orders").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["po-detail", id] });
      onChanged();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading || !po) {
    return (
      <DialogContent className="max-w-lg">
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      </DialogContent>
    );
  }

  const STEPS: PoStatus[] = ["draft", "ordered", "paid", "shipped", "received"];
  const nextStep = STEPS[STEPS.indexOf(po.status as PoStatus) + 1];

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-2 pr-6">
          <span className="font-mono">{po.code}</span>
          <StatusBadge tone={statusTone(po.status)}>{po.status}</StatusBadge>
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 text-sm">
        <div>
          <div className="font-semibold text-brand-navy">{po.supplier?.name}</div>
          <div className="text-muted-foreground">
            {po.supplier?.country}{" "}
            {po.supplier?.contact_name ? `— ${po.supplier.contact_name}` : ""}{" "}
            {po.supplier?.phone ?? ""}
          </div>
        </div>
        <div className="text-muted-foreground">{po.description}</div>
        <div className="grid grid-cols-3 gap-3 rounded-md bg-muted p-3">
          <div>
            <div className="text-xs text-muted-foreground">Cost</div>
            <div className="font-bold">
              {po.currency} {Number(po.supplier_cost).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Margin</div>
            <div className="font-bold text-brand-orange">
              {po.currency} {Number(po.margin_amount).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sell price</div>
            <div className="font-bold text-brand-navy">
              {po.currency} {Number(po.sell_price).toFixed(2)}
            </div>
          </div>
        </div>
        {po.proof_url && (
          <a
            href={po.proof_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand-sky hover:underline"
          >
            View payment proof
          </a>
        )}
        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          {po.status !== "cancelled" && po.status !== "received" && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => setStatus.mutate("cancelled")}
            >
              Cancel
            </Button>
          )}
          {nextStep && po.status !== "cancelled" && (
            <Button
              size="sm"
              className="bg-brand-orange hover:bg-brand-orange/90"
              onClick={() => setStatus.mutate(nextStep)}
            >
              Mark as {nextStep}
            </Button>
          )}
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
