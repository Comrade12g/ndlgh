import { Card } from "@/components/ui/card";
import { MilestoneTimeline, milestoneLabel, type MilestoneKey } from "./MilestoneTimeline";
import { MapPin, CalendarClock, Clock, Ship, Plane, Truck, Package, Scale, Box, Tag, RefreshCw } from "lucide-react";

export type CustomerShipment = {
  ndl_reference: string;
  origin_city: string | null;
  destination_city: string | null;
  current_milestone: MilestoneKey;
  current_eta: string | null;
  eta_last_changed_at: string | null;
  eta_recently_changed: boolean;
  mode?: string | null;
  matched_mark?: string | null;
  etd?: string | null;
  original_eta?: string | null;
  actual_departure?: string | null;
  actual_arrival?: string | null;
  last_checked_at?: string | null;
  vessel_or_flight?: string | null;
  carrier?: string | null;
  pieces?: number | null;
  weight_kg?: number | string | null;
  cbm?: number | string | null;
  package_count?: number | null;
  received_at?: string | null;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtDate(v?: string | null): string {
  if (!v) return "—";
  const d = new Date(v.length <= 10 ? `${v}T00:00:00` : v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function num(v?: number | string | null, digits = 2): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n) || n === 0) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function modeLabel(mode?: string | null) {
  switch (mode) {
    case "air":
      return { label: "Air freight", Icon: Plane };
    case "intercity":
      return { label: "Intercity delivery", Icon: Truck };
    case "sea_fcl":
      return { label: "Sea freight — FCL", Icon: Ship };
    case "sea_lcl":
      return { label: "Sea freight — LCL", Icon: Ship };
    default:
      return { label: "Freight", Icon: Ship };
  }
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/70 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-brand-navy" title={value}>
        {value}
      </div>
    </div>
  );
}

export function CustomerTrackingCard({ s }: { s: CustomerShipment }) {
  const { label: modeText, Icon: ModeIcon } = modeLabel(s.mode);
  const etaSlipped =
    s.original_eta && s.current_eta && s.original_eta !== s.current_eta ? s.original_eta : null;

  return (
    <Card className="overflow-hidden border bg-[hsl(38_40%_97%)] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Reference</div>
          <div className="font-mono text-2xl font-extrabold text-brand-navy">{s.ndl_reference}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-brand-orange" />
            <span className="font-medium text-foreground">{s.origin_city ?? "—"}</span>
            <span className="text-brand-orange">→</span>
            <span className="font-medium text-foreground">{s.destination_city ?? "Tema, Ghana"}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-navy/10 px-2.5 py-1 text-xs font-semibold text-brand-navy">
              <ModeIcon className="h-3.5 w-3.5" /> {modeText}
            </span>
            {s.matched_mark && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2.5 py-1 font-mono text-xs font-semibold text-brand-orange">
                <Tag className="h-3.5 w-3.5" /> {s.matched_mark}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-brand-navy px-4 py-3 text-white shadow-sm">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/70">
            <CalendarClock className="h-3 w-3" /> Estimated arrival
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">{fmtDate(s.current_eta)}</div>
          {etaSlipped && (
            <div className="mt-1 text-[11px] text-white/70">
              Originally <span className="line-through">{fmtDate(etaSlipped)}</span>
            </div>
          )}
          {s.eta_recently_changed && s.eta_last_changed_at && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-orange/95 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Clock className="h-3 w-3" /> Updated {timeAgo(s.eta_last_changed_at)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border bg-card/60 p-3">
        <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          Current status:{" "}
          <span className="font-semibold text-brand-navy">{milestoneLabel(s.current_milestone)}</span>
        </div>
        <MilestoneTimeline current={s.current_milestone} />
      </div>

      <div className="mt-3">
        <MilestoneJourney shipment={s} />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Shipment details
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="Received at warehouse" value={fmtDate(s.received_at)} />
          <Field label="Departed origin" value={fmtDate(s.actual_departure ?? s.etd)} />
          <Field label="Arrived destination" value={fmtDate(s.actual_arrival)} />
          <Field label={s.mode === "air" ? "Flight" : "Vessel / voyage"} value={s.vessel_or_flight || "—"} />
          <Field label="Carrier" value={s.carrier || "NDL Cargo"} />
          <Field label="Packages in shipment" value={s.package_count ? String(s.package_count) : "—"} />
          <Field label="Pieces" value={s.pieces ? String(s.pieces) : "—"} />
          <Field label="Weight" value={num(s.weight_kg) === "—" ? "—" : `${num(s.weight_kg)} kg`} />
          <Field label="Volume" value={num(s.cbm, 3) === "—" ? "—" : `${num(s.cbm, 3)} CBM`} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Last checked {s.last_checked_at ? timeAgo(s.last_checked_at) : "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Package className="h-3 w-3" /> Consolidated groupage cargo
        </span>
        <span className="inline-flex items-center gap-1">
          <Scale className="h-3 w-3" /> Chargeable basis: greater of weight or volume
        </span>
        <span className="inline-flex items-center gap-1">
          <Box className="h-3 w-3" /> Sign in for invoices &amp; item list
        </span>
      </div>
    </Card>
  );
}
