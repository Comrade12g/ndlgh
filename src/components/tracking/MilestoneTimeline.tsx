import { CheckCircle2, Circle, Truck, Ship, Anchor, FileCheck, PackageCheck, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export const MILESTONES = [
  { key: "picked_up",          label: "Picked up",          icon: PackageOpen },
  { key: "departed_origin",    label: "Departed origin",    icon: Ship },
  { key: "in_transit",         label: "In transit",         icon: Ship },
  { key: "arrived_tema",       label: "Arrived Tema Port",  icon: Anchor },
  { key: "customs_clearance",  label: "Customs clearance",  icon: FileCheck },
  { key: "out_for_delivery",   label: "Out for delivery",   icon: Truck },
  { key: "delivered",          label: "Delivered",          icon: PackageCheck },
] as const;

export type MilestoneKey = (typeof MILESTONES)[number]["key"];

export function MilestoneTimeline({ current }: { current: MilestoneKey }) {
  const idx = MILESTONES.findIndex((m) => m.key === current);
  const progress = idx < 0 ? 0 : (idx / (MILESTONES.length - 1)) * 100;
  const delivered = current === "delivered";

  return (
    <div className="w-full py-3">
      {/* Rail with gradient fill and gliding truck */}
      <div className="relative mx-2 mb-6 h-2 rounded-full bg-border/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-orange via-[#FDB760] to-brand-orange bg-[length:200%_100%]"
          style={{ width: `${progress}%`, animation: "gradient-pan 6s linear infinite" }}
        />
        {/* Traveling truck icon */}
        {!delivered && progress > 0 && (
          <div
            className="absolute -top-2.5 -translate-x-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${progress}%` }}
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-md ring-2 ring-brand-orange animate-bob">
              <Truck className="h-3.5 w-3.5 text-brand-orange" />
            </div>
          </div>
        )}
        {/* Delivered burst */}
        {delivered && (
          <div className="absolute -top-3 right-0 translate-x-1/2">
            <div className="relative grid h-8 w-8 place-items-center rounded-full bg-brand-orange text-white ring-4 ring-brand-orange/25">
              <PackageCheck className="h-4 w-4" />
              <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-orange ripple" />
            </div>
          </div>
        )}
      </div>

      <ol className="relative flex w-full items-start justify-between gap-1 overflow-x-auto">
        {MILESTONES.map((m, i) => {
          const done = i < idx;
          const active = i === idx;
          const Icon = active ? m.icon : done ? CheckCircle2 : Circle;
          return (
            <li key={m.key} className="flex flex-1 min-w-[88px] flex-col items-center text-center">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  active && "border-brand-orange bg-brand-orange text-white shadow-lg shadow-brand-orange/40 scale-110",
                  done && "border-brand-orange bg-brand-orange/10 text-brand-orange",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {active && (
                  <span className="pointer-events-none absolute h-9 w-9 rounded-full border-2 border-brand-orange/50 ripple" />
                )}
              </div>
              <span className={cn("mt-2 text-[11px] font-medium leading-tight", active ? "text-brand-navy font-semibold" : "text-muted-foreground")}>
                {m.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function milestoneLabel(key: string): string {
  return MILESTONES.find((m) => m.key === key)?.label ?? key;
}
