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
import { PageHeader, EmptyState } from "@/components/ops/PageHeader";
import { Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/treasury/accounts")({
  component: TreasuryPage,
});

function TreasuryPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: rates } = useQuery({
    queryKey: ["fx-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fx_rates")
        .select("id, currency, rate_to_ghs, effective_date")
        .order("effective_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: txns, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "id, txn_type, direction, amount, currency, fx_rate_to_ghs, occurred_at, reference, notes, agent_id",
        )
        .order("occurred_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Treasury"
        title="Accounts & Ledger"
        description="Daily FX rates, supplier payments, agent floats, and margin settlements — every currency reconciled to GHS."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <Plus className="mr-2 h-4 w-4" /> Set FX rate
              </Button>
            </DialogTrigger>
            <FxDialog
              onDone={() => {
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["fx-rates"] });
              }}
            />
          </Dialog>
        }
      />

      {/* FX rates */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-orange" />
          <h2 className="font-display text-lg font-bold text-brand-navy">Latest FX rates → GHS</h2>
        </div>
        {!rates?.length ? (
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">
              No FX rates set. Rates are used to reconcile multi-currency transactions to GHS.
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {rates.slice(0, 8).map((r) => (
              <Card key={r.id} className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {r.currency}
                </div>
                <div className="mt-1 font-display text-2xl font-extrabold text-brand-navy">
                  {Number(r.rate_to_ghs).toFixed(4)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">as of {r.effective_date}</div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Ledger */}
      <div className="mb-3">
        <h2 className="font-display text-lg font-bold text-brand-navy">Transaction ledger</h2>
      </div>
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !txns?.length ? (
          <EmptyState
            title="No transactions"
            description="Ledger entries appear here for supplier payments, agent floats, customer receipts, and margin settlements."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Direction</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(t.occurred_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-brand-navy">{t.txn_type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${t.direction === "credit" ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}`}
                      >
                        {t.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {t.currency} {Number(t.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.reference ?? t.notes ?? "—"}
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

function FxDialog({ onDone }: { onDone: () => void }) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const mut = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("fx_rates").insert({
        currency: currency.toUpperCase(),
        rate_to_ghs: Number(rate),
        effective_date: date,
        created_by: u.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("FX rate saved");
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Set daily FX rate</DialogTitle>
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
            <Label>Currency</Label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              maxLength={3}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Effective date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Rate → GHS (1 {currency.toUpperCase()} = ? GHS)</Label>
          <Input
            type="number"
            step="0.0001"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : "Save rate"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
