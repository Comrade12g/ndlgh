import { Card } from "@/components/ui/card";
import { MilestoneTimeline, milestoneLabel, type MilestoneKey } from "./MilestoneTimeline";
import { MapPin, CalendarClock, Clock } from "lucide-react";

export type CustomerShipment = {
  ndl_reference: string;
  origin_city: string | null;
  destination_city: string | null;
  current_milestone: MilestoneKey;
  current_eta: string | null;
  eta_last_changed_at: string | null;
  eta_recently_changed: boolean;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function CustomerTrackingCard({ s }: { s: CustomerShipment }) {
  return (
    <Card className="overflow-hidden border bg-[hsl(38_40%_97%)] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Reference</div>
          <div className="font-mono text-2xl font-extrabold text-brand-navy">{s.ndl_reference}</div>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-brand-orange" />
            <span className="font-medium text-foreground">{s.origin_city ?? "—"}</span>
            <span className="text-brand-orange">→</span>
            <span className="font-medium text-foreground">{s.destination_city ?? "Tema, Ghana"}</span>
          </div>
        </div>

        <div className="rounded-lg bg-brand-navy px-4 py-3 text-white shadow-sm">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/70">
            <CalendarClock className="h-3 w-3" /> ETA
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
            {s.current_eta ?? "—"}
          </div>
          {s.eta_recently_changed && s.eta_last_changed_at && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-orange/95 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Clock className="h-3 w-3" /> Updated {timeAgo(s.eta_last_changed_at)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border bg-card/60 p-3">
        <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          Current status: <span className="font-semibold text-brand-navy">{milestoneLabel(s.current_milestone)}</span>
        </div>
        <MilestoneTimeline current={s.current_milestone} />
      </div>
    </Card>
  );
}
