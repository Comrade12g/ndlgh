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
  return (
    <ol className="relative flex w-full items-start justify-between gap-1 overflow-x-auto py-2">
      {MILESTONES.map((m, i) => {
        const done = i < idx;
        const active = i === idx;
        const Icon = active ? m.icon : done ? CheckCircle2 : Circle;
        return (
          <li key={m.key} className="flex flex-1 min-w-[88px] flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div className={cn("h-0.5 flex-1", i === 0 ? "opacity-0" : done || active ? "bg-brand-orange" : "bg-border")} />
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  active && "border-brand-orange bg-brand-orange text-white shadow-md",
                  done && "border-brand-orange bg-brand-orange/10 text-brand-orange",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className={cn("h-0.5 flex-1", i === MILESTONES.length - 1 ? "opacity-0" : done ? "bg-brand-orange" : "bg-border")} />
            </div>
            <span className={cn("mt-2 text-[11px] font-medium leading-tight", active ? "text-brand-navy" : "text-muted-foreground")}>
              {m.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function milestoneLabel(key: string): string {
  return MILESTONES.find((m) => m.key === key)?.label ?? key;
}
