import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useReveal } from "@/hooks/use-reveal";
import { Ship, ShieldCheck, MapPin, Users } from "lucide-react";
import { getPublicStats } from "@/lib/public-stats.functions";

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  end: number;
  suffix: string;
  label: string;
}

export function StatsBand() {
  const ref = useReveal<HTMLDivElement>();
  const fetchStats = useServerFn(getPublicStats);
  const { data } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => fetchStats(),
    staleTime: 10 * 60_000,
  });

  const stats: StatItem[] = [
    { icon: Ship, end: data?.shipments ?? 120, suffix: "+", label: "Shipments delivered" },
    { icon: ShieldCheck, end: data?.cleared ?? 50, suffix: "+", label: "Containers cleared at Tema" },
    { icon: Users, end: data?.customers ?? 200, suffix: "+", label: "Ghanaian importers served" },
    { icon: MapPin, end: data?.regions ?? 16, suffix: "", label: "Ghana regions covered" },
  ];

  return (
    <section
      aria-label="NDL Cargo Ghana by the numbers"
      className="relative overflow-hidden bg-brand-navy py-16 text-white"
    >
      <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-orange/25 blur-3xl animate-blob" />
      <div
        className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-sky/25 blur-3xl animate-blob"
        style={{ animationDelay: "-6s" }}
      />
      <div ref={ref} className="reveal relative mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            By the numbers
          </div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">
            Trusted freight, backed by real volume
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <StatCell key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCell({ icon: Icon, end, suffix, label }: StatItem) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const start = () => {
      if (started.current) return;
      started.current = true;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setValue(end);
        return;
      }
      const t0 = performance.now();
      const duration = 1800;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && start()),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="rounded-xl bg-white/10 p-3 text-brand-orange ring-1 ring-white/15 backdrop-blur">
        <Icon className="h-6 w-6" />
      </div>
      <span
        ref={spanRef}
        className="mt-3 font-display text-3xl font-black tabular-nums md:text-4xl"
      >
        {value.toLocaleString()}
        {suffix}
      </span>
      <div className="mt-1 text-xs uppercase tracking-widest text-white/70">{label}</div>
    </div>
  );
}
