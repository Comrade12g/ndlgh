import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { openWhatsApp, waTemplates, copyToClipboard } from "@/lib/whatsapp";
import { Plus, Trash2, Search, Receipt, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/invoices")({
  component: InvoicesPage,
});

type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "void" | "overdue";
type PaymentMethod = "cash" | "bank" | "mobile_money" | "card" | "paystack" | "other";

function InvoicesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newOpen, setNewOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", search, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("invoices")
        .select(
          "id, number, currency, subtotal, total, amount_paid, status, issue_date, due_date, customer_id",
        )
        .order("issue_date", { ascending: false })
        .limit(200);
      if (statusFilter !== "all") q = q.eq("status", statusFilter as InvoiceStatus);
      const { data, error } = await q;
      if (error) throw error;
      const rows = data ?? [];

      const customerIds = Array.from(
        new Set(rows.map((r) => r.customer_id).filter((v): v is string => !!v)),
      );
      const { data: profiles } = customerIds.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, phone, shipping_mark")
            .in("id", customerIds)
        : {
            data: [] as {
              id: string;
              full_name: string | null;
              phone: string | null;
              shipping_mark: string;
            }[],
          };
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      let withCustomer = rows.map((r) => ({
        ...r,
        customer: r.customer_id ? byId.get(r.customer_id) : undefined,
      }));

      if (search) {
        const s = search.toLowerCase();
        withCustomer = withCustomer.filter(
          (r) =>
            r.number.toLowerCase().includes(s) ||
            r.customer?.full_name?.toLowerCase().includes(s) ||
            r.customer?.shipping_mark?.toLowerCase().includes(s),
        );
      }
      return withCustomer;
    },
  });

  const totals = useMemo(() => {
    const byCurrency: Record<string, { total: number; outstanding: number }> = {};
    for (const inv of invoices ?? []) {
      const cur = byCurrency[inv.currency] ?? { total: 0, outstanding: 0 };
      cur.total += Number(inv.total);
      cur.outstanding += Number(inv.total) - Number(inv.amount_paid);
      byCurrency[inv.currency] = cur;
    }
    return byCurrency;
  }, [invoices]);

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Multi-currency invoices for freight, sourcing, and delivery. Create, bill line items, and record payments."
        actions={
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <Plus className="mr-2 h-4 w-4" /> New invoice
              </Button>
            </DialogTrigger>
            <NewInvoiceDialog
              onDone={(id) => {
                setNewOpen(false);
                qc.invalidateQueries({ queryKey: ["invoices"] });
                setDetailId(id);
              }}
            />
          </Dialog>
        }
      />

      {Object.keys(totals).length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(totals).map(([cur, t]) => (
            <Card key={cur} className="p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Outstanding ({cur})
              </div>
              <div className="mt-1 font-display text-2xl font-extrabold text-brand-navy">
                {cur} {t.outstanding.toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                of {cur} {t.total.toFixed(2)} billed
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer, or mark…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !invoices?.length ? (
          <EmptyState
            title="No invoices yet"
            description="Issue your first invoice once a shipment or delivery is ready to bill."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Issued</th>
                  <th className="px-4 py-3 text-left">Due</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const c = inv.customer;
                  return (
                    <tr
                      key={inv.id}
                      className="cursor-pointer border-t hover:bg-muted/30"
                      onClick={() => setDetailId(inv.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-brand-navy">
                        {inv.number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-brand-navy">{c?.full_name ?? "—"}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {c?.shipping_mark ?? ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.issue_date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.due_date ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {inv.currency} {Number(inv.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.currency} {Number(inv.amount_paid).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={statusTone(inv.status)}>{inv.status}</StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        {detailId && (
          <InvoiceDetailDialog
            id={detailId}
            onChanged={() => qc.invalidateQueries({ queryKey: ["invoices"] })}
          />
        )}
      </Dialog>
    </div>
  );
}

type LineItem = { description: string; qty: number; unit_price: number };

type FreightSuggestion = {
  shipmentId: string;
  code: string;
  mode: string;
  route: string;
  customerCbm: number;
  customerWeightKg: number;
  rate: { unit: string; price: number; currency: string; min_qty: number | null } | null;
  billableQty: number;
  amount: number;
};

/** Finds the customer's shipments and matches each to an active rate, computing a suggested freight line (with minimum-qty applied). */
function useFreightSuggestions(customerId: string) {
  return useQuery({
    queryKey: ["freight-suggestions", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<FreightSuggestion[]> => {
      const { data: packages } = await supabase
        .from("packages")
        .select("id, cbm, weight_kg")
        .eq("customer_id", customerId);
      if (!packages?.length) return [];
      const packageIds = packages.map((p) => p.id);
      const cbmById = new Map(packages.map((p) => [p.id, Number(p.cbm ?? 0)]));
      const weightById = new Map(packages.map((p) => [p.id, Number(p.weight_kg ?? 0)]));

      const { data: links } = await supabase
        .from("shipment_packages")
        .select("shipment_id, package_id")
        .in("package_id", packageIds);
      if (!links?.length) return [];

      const byShipment = new Map<string, { cbm: number; weight: number }>();
      for (const l of links) {
        const cur = byShipment.get(l.shipment_id) ?? { cbm: 0, weight: 0 };
        cur.cbm += cbmById.get(l.package_id) ?? 0;
        cur.weight += weightById.get(l.package_id) ?? 0;
        byShipment.set(l.shipment_id, cur);
      }

      const shipmentIds = Array.from(byShipment.keys());
      const { data: shipments } = await supabase
        .from("shipments")
        .select("id, code, mode, origin_warehouse, destination_warehouse")
        .in("id", shipmentIds);

      // Guard against double-billing: packages get auto-invoiced individually
      // the moment they're intaken (see fn_autoinvoice_package trigger). If a
      // shipment's packages already have invoice_items, don't suggest adding
      // another freight line for the same cargo.
      const { data: alreadyInvoiced } = await supabase
        .from("invoice_items")
        .select("package_id")
        .in("package_id", packageIds);
      const invoicedPackageIds = new Set(
        (alreadyInvoiced ?? []).map((r) => r.package_id).filter(Boolean),
      );

      const suggestions: FreightSuggestion[] = [];
      for (const s of shipments ?? []) {
        const totals = byShipment.get(s.id)!;
        const shipmentPackageIds = links
          .filter((l) => l.shipment_id === s.id)
          .map((l) => l.package_id);
        const alreadyBilled = shipmentPackageIds.every((pid) => invoicedPackageIds.has(pid));
        if (alreadyBilled) continue; // already auto-invoiced per package — skip to avoid double charging
        if (!s.origin_warehouse || !s.destination_warehouse) continue; // can't rate-match an incomplete shipment

        const { data: rate } = await supabase
          .from("rates")
          .select("unit, price, currency, min_qty")
          .eq("origin_code", s.origin_warehouse)
          .eq("destination_code", s.destination_warehouse)
          .eq("mode", s.mode)
          .eq("active", true)
          .order("effective_from", { ascending: false })
          .limit(1)
          .maybeSingle();

        let billableQty = 1;
        let amount = rate?.price ?? 0;
        if (rate?.unit === "CBM") {
          billableQty = Math.max(totals.cbm, rate.min_qty ?? 0);
          amount = billableQty * rate.price;
        } else if (rate?.unit === "KG") {
          billableQty = Math.max(totals.weight, rate.min_qty ?? 0);
          amount = billableQty * rate.price;
        }

        suggestions.push({
          shipmentId: s.id,
          code: s.code,
          mode: s.mode,
          route: `${s.origin_warehouse} → ${s.destination_warehouse}`,
          customerCbm: totals.cbm,
          customerWeightKg: totals.weight,
          rate: rate ?? null,
          billableQty,
          amount,
        });
      }
      return suggestions;
    },
  });
}

function FreightSuggestions({
  customerId,
  onAdd,
}: {
  customerId: string;
  onAdd: (item: LineItem, currency: string) => void;
}) {
  const { data: suggestions, isLoading } = useFreightSuggestions(customerId);

  if (!customerId) return null;
  if (isLoading)
    return (
      <div className="text-xs text-muted-foreground">Checking shipments for a rate match…</div>
    );
  if (!suggestions?.length) return null;

  return (
    <div className="grid gap-2 rounded-md border border-brand-orange/30 bg-brand-orange/5 p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-orange">
        Freight suggestions (not yet auto-billed)
      </div>
      <div className="text-xs text-muted-foreground -mt-1">
        Most packages are billed automatically the moment they're received. These are shipments
        whose packages haven't been invoiced yet — add manually only if you're sure it wasn't
        already billed.
      </div>
      {suggestions.map((s) => (
        <div key={s.shipmentId} className="flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono font-semibold text-brand-navy">{s.code}</span>
            <span className="ml-2 text-muted-foreground">
              {s.route} · {s.mode.replace("_", " ")}
            </span>
            {s.rate ? (
              <div className="text-muted-foreground">
                {s.customerCbm.toFixed(3)} CBM{s.rate.min_qty ? ` (min ${s.rate.min_qty})` : ""} ×{" "}
                {s.rate.currency} {s.rate.price.toFixed(2)}
              </div>
            ) : (
              <div className="text-red-600">
                No active rate for this route/mode — add one on the Rates page
              </div>
            )}
          </div>
          {s.rate && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onAdd(
                  {
                    description: `Freight — ${s.code} (${s.mode.replace("_", " ")}, ${s.route})`,
                    qty: s.billableQty,
                    unit_price: s.rate!.price,
                  },
                  s.rate!.currency,
                )
              }
            >
              Add {s.rate.currency} {s.amount.toFixed(2)}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function NewInvoiceDialog({ onDone }: { onDone: (id: string) => void }) {
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, unit_price: 0 }]);

  const { data: customers } = useQuery({
    queryKey: ["profiles-search", customerSearch],
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

  const subtotal = items.reduce((s, i) => s + i.qty * i.unit_price, 0);

  const mut = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("Select a customer");
      const validItems = items.filter((i) => i.description.trim());
      if (!validItems.length) throw new Error("Add at least one line item");

      const { data: u } = await supabase.auth.getUser();
      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert({
          customer_id: customerId,
          currency,
          subtotal,
          tax: 0,
          total: subtotal,
          status: "sent",
          due_date: dueDate || null,
          notes: notes || null,
          created_by: u.user?.id,
        })
        .select("id, number")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("invoice_items").insert(
        validItems.map((i) => ({
          invoice_id: invoice.id,
          description: i.description,
          qty: i.qty,
          unit_price: i.unit_price,
          amount: i.qty * i.unit_price,
        })),
      );
      if (itemsError) throw itemsError;
      return invoice;
    },
    onSuccess: (inv) => {
      toast.success(`Invoice ${inv.number} created`);
      onDone(inv.id);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function handleAddFreightLine(item: LineItem, rateCurrency: string) {
    const hasRealItems = items.some((i) => i.description.trim());
    if (hasRealItems && rateCurrency !== currency) {
      toast.error(
        `This rate is in ${rateCurrency} but the invoice is already in ${currency}. Create separate invoices to avoid mixing currencies.`,
      );
      return;
    }
    if (!hasRealItems) setCurrency(rateCurrency);
    setItems((prev) => {
      const withoutBlankFirst = prev.length === 1 && !prev[0].description.trim() ? [] : prev;
      return [...withoutBlankFirst, item];
    });
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-brand-orange" /> New invoice
        </DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-4"
      >
        <div className="grid gap-2">
          <Label>Customer</Label>
          <Input
            placeholder="Search by name, shipping mark, or phone…"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer…" />
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

        {customerId && <FreightSuggestions customerId={customerId} onAdd={handleAddFreightLine} />}

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GHS">GHS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Line items</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setItems((p) => [...p, { description: "", qty: 1, unit_price: 0 }])}
            >
              <Plus className="mr-1 h-3 w-3" /> Add item
            </Button>
          </div>
          <div className="grid gap-2">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-6"
                  placeholder="Description (e.g. Freight — 2.5 CBM sea)"
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                />
                <Input
                  className="col-span-2"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                />
                <Input
                  className="col-span-3"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Unit price"
                  value={item.unit_price}
                  onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="col-span-1"
                  disabled={items.length === 1}
                  onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-muted p-3 text-right text-sm">
          Total:{" "}
          <span className="font-display text-lg font-extrabold text-brand-navy">
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>

        <div className="grid gap-2">
          <Label>Notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Creating…" : "Create & send invoice"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function InvoiceDetailDialog({ id, onChanged }: { id: string; onChanged: () => void }) {
  const qc = useQueryClient();
  const [payOpen, setPayOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "id, number, currency, subtotal, tax, total, amount_paid, status, issue_date, due_date, notes, customer_id",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      const { data: customer } = data.customer_id
        ? await supabase
            .from("profiles")
            .select("full_name, phone, shipping_mark")
            .eq("id", data.customer_id)
            .maybeSingle()
        : {
            data: null as null | {
              full_name: string | null;
              phone: string | null;
              shipping_mark: string;
            },
          };
      return { ...data, customer };
    },
  });

  const { data: items } = useQuery({
    queryKey: ["invoice-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("id, description, qty, unit_price, amount")
        .eq("invoice_id", id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["invoice-payments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount, currency, method, reference, received_at")
        .eq("invoice_id", id)
        .order("received_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async (status: InvoiceStatus) => {
      const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["invoice-detail", id] });
      onChanged();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading || !invoice) {
    return (
      <DialogContent className="max-w-2xl">
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      </DialogContent>
    );
  }

  const outstanding = Number(invoice.total) - Number(invoice.amount_paid);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-2 pr-6">
          <span className="font-mono">{invoice.number}</span>
          <StatusBadge tone={statusTone(invoice.status)}>{invoice.status}</StatusBadge>
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Customer</div>
            <div className="font-semibold text-brand-navy">
              {invoice.customer?.full_name ?? "—"}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              {invoice.customer?.shipping_mark}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Dates</div>
            <div>Issued {invoice.issue_date}</div>
            <div className="text-muted-foreground">Due {invoice.due_date ?? "—"}</div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Line items
          </div>
          <div className="rounded-md border">
            {items?.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between border-b px-3 py-2 text-sm last:border-b-0"
              >
                <div>
                  {it.description} <span className="text-muted-foreground">× {Number(it.qty)}</span>
                </div>
                <div className="font-semibold">
                  {invoice.currency} {Number(it.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-md bg-muted p-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-bold">
              {invoice.currency} {Number(invoice.total).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Paid</div>
            <div className="font-bold text-emerald-700">
              {invoice.currency} {Number(invoice.amount_paid).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Outstanding</div>
            <div className="font-bold text-brand-orange">
              {invoice.currency} {outstanding.toFixed(2)}
            </div>
          </div>
        </div>

        {payments && payments.length > 0 && (
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Payment history
            </div>
            <div className="rounded-md border">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b px-3 py-2 text-sm last:border-b-0"
                >
                  <div>
                    {new Date(p.received_at).toLocaleDateString()} — {p.method.replace("_", " ")}{" "}
                    {p.reference ? `(${p.reference})` : ""}
                  </div>
                  <div className="font-semibold text-emerald-700">
                    {p.currency} {Number(p.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {invoice.status === "draft" && (
              <Button size="sm" variant="outline" onClick={() => setStatus.mutate("sent")}>
                Mark as sent
              </Button>
            )}
            {invoice.status !== "void" && invoice.status !== "paid" && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => setStatus.mutate("void")}
              >
                Void
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                const name = invoice.customer?.full_name ?? "there";
                const msg = waTemplates.invoiceIssued(
                  name,
                  invoice.number,
                  invoice.currency,
                  Number(invoice.total),
                  invoice.due_date,
                );
                if (!openWhatsApp(invoice.customer?.phone, msg))
                  toast.error("No valid phone number on file");
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Notify on WhatsApp
            </Button>
            <Button
              size="icon"
              variant="outline"
              title="Copy message (use if WhatsApp Web won't refresh an already-open chat)"
              onClick={async () => {
                const name = invoice.customer?.full_name ?? "there";
                const msg = waTemplates.invoiceIssued(
                  name,
                  invoice.number,
                  invoice.currency,
                  Number(invoice.total),
                  invoice.due_date,
                );
                if (await copyToClipboard(msg))
                  toast.success("Message copied — paste it into the chat");
                else toast.error("Couldn't copy — check clipboard permissions");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {outstanding > 0 && invoice.status !== "void" && (
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90">
                  Record payment
                </Button>
              </DialogTrigger>
              <RecordPaymentDialog
                invoiceId={id}
                invoiceNumber={invoice.number}
                customerId={invoice.customer_id ?? ""}
                customerName={invoice.customer?.full_name ?? "there"}
                customerPhone={invoice.customer?.phone}
                currency={invoice.currency}
                maxAmount={outstanding}
                onDone={() => {
                  setPayOpen(false);
                  qc.invalidateQueries({ queryKey: ["invoice-detail", id] });
                  qc.invalidateQueries({ queryKey: ["invoice-payments", id] });
                  onChanged();
                }}
              />
            </Dialog>
          )}
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

function RecordPaymentDialog({
  invoiceId,
  invoiceNumber,
  customerId,
  customerName,
  customerPhone,
  currency,
  maxAmount,
  onDone,
}: {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null | undefined;
  currency: string;
  maxAmount: number;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState(maxAmount.toFixed(2));
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const { data: u } = await supabase.auth.getUser();

      const { error: payError } = await supabase.from("payments").insert({
        invoice_id: invoiceId,
        customer_id: customerId,
        amount: amt,
        currency,
        method,
        reference: reference || null,
        notes: notes || null,
        received_by: u.user?.id,
      });
      if (payError) throw payError;

      // Recompute invoice paid amount + status from full payment history (source of truth)
      const { data: allPayments, error: sumError } = await supabase
        .from("payments")
        .select("amount")
        .eq("invoice_id", invoiceId);
      if (sumError) throw sumError;
      const totalPaid = (allPayments ?? []).reduce((s, p) => s + Number(p.amount), 0);

      const { data: inv, error: invError } = await supabase
        .from("invoices")
        .select("total")
        .eq("id", invoiceId)
        .single();
      if (invError) throw invError;

      const newStatus: InvoiceStatus =
        totalPaid >= Number(inv.total) ? "paid" : totalPaid > 0 ? "partial" : "sent";

      const { error: updateError } = await supabase
        .from("invoices")
        .update({ amount_paid: totalPaid, status: newStatus })
        .eq("id", invoiceId);
      if (updateError) throw updateError;

      // Ledger entry for treasury reconciliation
      await supabase.from("transactions").insert({
        txn_type: "customer_receipt",
        direction: "credit",
        amount: amt,
        currency,
        customer_id: customerId,
        invoice_id: invoiceId,
        reference: reference || null,
        notes: notes || null,
        created_by: u.user?.id,
      });

      return { amt, outstanding: Math.max(0, Number(inv.total) - totalPaid) };
    },
    onSuccess: (res) => {
      toast.success("Payment recorded");
      const msg = waTemplates.paymentReceived(
        customerName,
        invoiceNumber,
        currency,
        res.amt,
        res.outstanding,
      );
      openWhatsApp(customerPhone, msg);
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Record payment</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-3"
      >
        <div className="grid gap-2">
          <Label>Amount ({currency})</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <div className="text-xs text-muted-foreground">
            Outstanding: {currency} {maxAmount.toFixed(2)}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Method</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile_money">Mobile money</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank transfer</SelectItem>
              <SelectItem value="paystack">Paystack</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Reference</Label>
          <Input
            placeholder="MoMo transaction ID, etc."
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : "Record payment"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
