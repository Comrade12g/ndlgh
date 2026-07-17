import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ops/PageHeader";
import { milestoneLabel } from "@/components/tracking/MilestoneTimeline";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tracking")({
  component: TrackingBoard,
});

type ShipmentRow = {
  id: string;
  ndl_reference: string | null;
  carrier: string | null;
  container_no: string | null;
  booking_no: string | null;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  destination_warehouse: string | null;
  original_eta: string | null;
  eta: string | null;
  eta_last_changed_at: string | null;
  last_checked_at: string | null;
  current_milestone: string;
  status: string;
};

function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

function FlipText({ value }: { value: string }) {
  // Re-mount on value change to retrigger CSS animation
  return (
    <span key={value} className="flap-cell font-mono tabular-nums text-amber-400">
      {value}
    </span>
  );
}

function TrackingBoard() {
  const [carrier, setCarrier] = useState<string>("all");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [q, setQ] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["ops-tracking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select(
          "id, ndl_reference, carrier, container_no, booking_no, port_of_loading, port_of_discharge, destination_warehouse, original_eta, eta, eta_last_changed_at, last_checked_at, current_milestone, status",
        )
        .order("eta", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as ShipmentRow[];
    },
  });

  const rows = useMemo(() => {
    const cutoff = Date.now() - 7 * 86_400_000;
    return (data ?? []).filter((r) => {
      if (carrier !== "all" && (r.carrier ?? "").toLowerCase() !== carrier.toLowerCase())
        return false;
      if (onlyChanged) {
        if (!r.eta_last_changed_at) return false;
        if (new Date(r.eta_last_changed_at).getTime() < cutoff) return false;
      }
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        const hay = [r.ndl_reference, r.container_no, r.booking_no, r.carrier]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [data, carrier, onlyChanged, q]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Internal"
        title="ETA Tracking Board"
        description="Live carrier ETAs for ocean freight to Tema"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} /> Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={carrier} onValueChange={setCarrier}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Carrier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All carriers</SelectItem>
            <SelectItem value="PIL">PIL</SelectItem>
            <SelectItem value="MSC">MSC</SelectItem>
            <SelectItem value="Maersk">Maersk</SelectItem>
            <SelectItem value="CMA CGM">CMA CGM</SelectItem>
            <SelectItem value="COSCO">COSCO</SelectItem>
          </SelectContent>
        </Select>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyChanged}
            onChange={(e) => setOnlyChanged(e.target.checked)}
            className="h-4 w-4 accent-brand-orange"
          />
          Only ETA changed (7 days)
        </label>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ref / container / booking"
          className="w-64"
        />
      </div>

      {/* Split-flap board */}
      <Card className="overflow-hidden border-0 bg-[#0a1a30] p-0 text-amber-100 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
            <thead className="bg-black/40 text-[11px] uppercase tracking-widest text-amber-200/80">
              <tr>
                <th className="px-4 py-3 text-left">Ref</th>
                <th className="px-4 py-3 text-left">Carrier</th>
                <th className="px-4 py-3 text-left">Container</th>
                <th className="px-4 py-3 text-left">Booking</th>
                <th className="px-4 py-3 text-left">POL → POD</th>
                <th className="px-4 py-3 text-left">Milestone</th>
                <th className="px-4 py-3 text-right">Original ETA</th>
                <th className="px-4 py-3 text-right">Current ETA</th>
                <th className="px-4 py-3 text-right">Δ days</th>
                <th className="px-4 py-3 text-right">Checked</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-amber-200/60">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && !rows.length && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-amber-200/60">
                    No shipments match the filters.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const delta = daysBetween(r.original_eta, r.eta);
                const changedRecent =
                  r.eta_last_changed_at &&
                  Date.now() - new Date(r.eta_last_changed_at).getTime() < 7 * 86_400_000;
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-t border-white/5 transition-colors hover:bg-white/5",
                      changedRecent && "bg-amber-500/5",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-3 font-mono font-bold text-white",
                        changedRecent && "border-l-4 border-amber-400",
                      )}
                    >
                      {r.ndl_reference ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-amber-100">{r.carrier ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-white/80">{r.container_no ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-white/60">{r.booking_no ?? "—"}</td>
                    <td className="px-4 py-3 text-white/80">
                      {(r.port_of_loading ?? "—") + " → " + (r.port_of_discharge ?? "Tema")}
                    </td>
                    <td className="px-4 py-3 text-amber-200">
                      {milestoneLabel(r.current_milestone)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white/60">
                      {r.original_eta ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-lg">
                      <FlipText value={r.eta ?? "—"} />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-mono tabular-nums",
                        delta === null && "text-white/40",
                        delta !== null && delta > 0 && "text-red-300",
                        delta !== null && delta < 0 && "text-emerald-300",
                        delta === 0 && "text-white/60",
                      )}
                    >
                      {delta === null ? "—" : delta > 0 ? `+${delta}` : delta}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-white/50">
                      {r.last_checked_at
                        ? new Date(r.last_checked_at).toLocaleString(undefined, {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "never"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        This board is internal only. Carrier, container, and booking numbers are never shown on the
        customer portal.
      </p>
    </div>
  );
}
