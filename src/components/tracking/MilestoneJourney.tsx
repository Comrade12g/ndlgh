import { useMemo, useState } from "react";
import { MILESTONES, type MilestoneKey } from "./MilestoneTimeline";
import { cn } from "@/lib/utils";
import { CalendarClock, Filter, MapPin, RotateCcw, CheckCircle2, Loader2, Circle } from "lucide-react";

export type JourneyShipment = {
  current_milestone: MilestoneKey;
  origin_city?: string | null;
  destination_city?: string | null;
  mode?: string | null;
  received_at?: string | null;
  etd?: string | null;
  actual_departure?: string | null;
  actual_arrival?: string | null;
  current_eta?: string | null;
};

type Status = "done" | "current" | "upcoming";

export type JourneyEvent = {
  key: MilestoneKey;
  label: string;
  status: Status;
  date: string | null;
  dateLabel: string;
  location: string;
};

const STATUS_META: Record<Status, { label: string; Icon: typeof CheckCircle2; cls: string }> = {
  done: { label: "Completed", Icon: CheckCircle2, cls: "bg-brand-orange/10 text-brand-orange border-brand-orange/30" },
  current: { label: "In progress", Icon: Loader2, cls: "bg-brand-navy text-white border-brand-navy" },
  upcoming: { label: "Upcoming", Icon: Circle, cls: "bg-muted text-muted-foreground border-border" },
};

function fmt(v?: string | null): string {
  if (!v) return "—";
  const d = new Date(v.length <= 10 ? `${v}T00:00:00` : v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

/** Build the 7-step journey with a date + location for each milestone. */
export function buildJourney(s: JourneyShipment): JourneyEvent[] {
  const idx = MILESTONES.findIndex((m) => m.key === s.current_milestone);
  const origin = s.origin_city || "Origin";
  const dest = s.destination_city || "Tema, Ghana";
  const gateway = s.mode === "air" ? "Kotoka International, Accra" : "Tema Port, Ghana";

  const dateFor: Record<MilestoneKey, string | null> = {
    picked_up: s.received_at ?? null,
    departed_origin: s.actual_departure ?? s.etd ?? null,
    in_transit: s.actual_departure ?? s.etd ?? null,
    arrived_tema: s.actual_arrival ?? s.current_eta ?? null,
    customs_clearance: s.actual_arrival ?? s.current_eta ?? null,
    out_for_delivery: null,
    delivered: null,
  };
  const locationFor: Record<MilestoneKey, string> = {
    picked_up: origin,
    departed_origin: origin,
    in_transit: s.mode === "air" ? "In the air" : "At sea",
    arrived_tema: gateway,
    customs_clearance: gateway,
    out_for_delivery: dest,
    delivered: dest,
  };

  return MILESTONES.map((m, i) => {
    const status: Status = idx < 0 ? "upcoming" : i < idx ? "done" : i === idx ? "current" : "upcoming";
    const date = dateFor[m.key];
    return {
      key: m.key,
      label: m.label,
      status,
      date,
      dateLabel: fmt(date),
      location: locationFor[m.key],
    };
  });
}

type Sort = "asc" | "desc";

/**
 * MilestoneJourney — filterable milestone list for tracking pages.
 * Filter by status, location, and date window; sort oldest/newest first.
 */
export function MilestoneJourney({ shipment }: { shipment: JourneyShipment }) {
  const events = useMemo(() => buildJourney(shipment), [shipment]);
  const [status, setStatus] = useState<"all" | Status>("all");
  const [location, setLocation] = useState("all");
  const [dateWindow, setDateWindow] = useState<"all" | "dated" | "30" | "90">("all");
  const [sort, setSort] = useState<Sort>("asc");

  const locations = useMemo(
    () => Array.from(new Set(events.map((e) => e.location))),
    [events],
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const out = events.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (location !== "all" && e.location !== location) return false;
      if (dateWindow === "dated" && !e.date) return false;
      if (dateWindow === "30" || dateWindow === "90") {
        if (!e.date) return false;
        const t = new Date(e.date.length <= 10 ? `${e.date}T00:00:00` : e.date).getTime();
        if (Number.isNaN(t)) return false;
        const days = Number(dateWindow);
        if (Math.abs(now - t) > days * 86400000) return false;
      }
      return true;
    });
    return sort === "asc" ? out : [...out].reverse();
  }, [events, status, location, dateWindow, sort]);

  const dirty = status !== "all" || location !== "all" || dateWindow !== "all" || sort !== "asc";

  return (
    <div className="rounded-xl border bg-card/60 p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Milestone filters
        </div>
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setStatus("all");
              setLocation("all");
              setDateWindow("all");
              setSort("asc");
            }}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition hover:bg-secondary"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Status chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["all", "done", "current", "upcoming"] as const).map((k) => {
          const active = status === k;
          const count = k === "all" ? events.length : events.filter((e) => e.status === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setStatus(k)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                active
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-border bg-card text-muted-foreground hover:border-brand-orange/50 hover:text-brand-navy",
              )}
            >
              {k === "all" ? "All stages" : STATUS_META[k].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Location + date + sort */}
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <label className="relative">
          <span className="sr-only">Filter by location</span>
          <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-orange" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border bg-card py-2 pl-8 pr-2 text-xs font-medium text-foreground"
          >
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="relative">
          <span className="sr-only">Filter by date</span>
          <CalendarClock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-orange" />
          <select
            value={dateWindow}
            onChange={(e) => setDateWindow(e.target.value as typeof dateWindow)}
            className="w-full rounded-lg border bg-card py-2 pl-8 pr-2 text-xs font-medium text-foreground"
          >
            <option value="all">Any date</option>
            <option value="dated">Has a date</option>
            <option value="30">Within 30 days</option>
            <option value="90">Within 90 days</option>
          </select>
        </label>
        <label className="relative">
          <span className="sr-only">Sort order</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="w-full rounded-lg border bg-card px-2 py-2 text-xs font-medium text-foreground"
          >
            <option value="asc">Oldest stage first</option>
            <option value="desc">Latest stage first</option>
          </select>
        </label>
      </div>

      {/* Filtered event list */}
      <ol className="mt-4 space-y-2">
        {filtered.length === 0 && (
          <li className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No milestones match these filters.
          </li>
        )}
        {filtered.map((e) => {
          const meta = STATUS_META[e.status];
          return (
            <li
              key={e.key}
              className="flex flex-wrap items-center gap-3 rounded-lg border bg-card/80 p-3 transition hover:border-brand-orange/40"
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                  meta.cls,
                )}
              >
                <meta.Icon className={cn("h-4 w-4", e.status === "current" && "animate-spin")} />
              </span>
              <span className="min-w-[8rem] flex-1">
                <span className="block text-sm font-semibold text-brand-navy">{e.label}</span>
                <span className="block text-xs text-muted-foreground">{meta.label}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-brand-orange" /> {e.location}
              </span>
              <span className="ml-auto font-mono text-xs font-semibold tabular-nums text-brand-navy">
                {e.dateLabel}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
