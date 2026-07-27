import { useCountUp, useReveal } from "@/hooks/use-reveal";
import { Boxes, Ship, MapPin, Users } from "lucide-react";

const STATS = [
  { icon: Boxes, end: 12500, suffix: "+", label: "CBM shipped" },
  { icon: Ship, end: 420, suffix: "+", label: "Containers cleared" },
  { icon: MapPin, end: 16, suffix: "", label: "Ghana regions served" },
  { icon: Users, end: 3200, suffix: "+", label: "Happy customers" },
];

export function StatsBand() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative overflow-hidden bg-brand-navy py-14 text-white">
      <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-orange/25 blur-3xl animate-blob" />
      <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-sky/25 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      <div ref={ref} className="reveal relative mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        {STATS.map((s) => (
          <StatCell key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

function StatCell({ icon: Icon, end, suffix, label }: { icon: React.ComponentType<{ className?: string }>; end: number; suffix: string; label: string }) {
  const { ref, value } = useCountUp(end, 1800);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="rounded-xl bg-white/10 p-3 text-brand-orange ring-1 ring-white/15 backdrop-blur">
        <Icon className="h-6 w-6" />
      </div>
      <span ref={ref} className="mt-3 font-display text-3xl font-black tabular-nums md:text-4xl">
        {value.toLocaleString()}{suffix}
      </span>
      <div className="mt-1 text-xs uppercase tracking-widest text-white/70">{label}</div>
    </div>
  );
}
