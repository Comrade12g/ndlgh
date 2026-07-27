const HUBS = [
  "Yiwu", "Guangzhou", "Taizhou", "Shenzhen", "Dubai", "Bangkok",
  "Toronto", "New York", "Los Angeles", "Istanbul", "Accra", "Kumasi", "Tema",
];

export function LaneMarquee() {
  const items = [...HUBS, ...HUBS];
  return (
    <div className="relative overflow-hidden border-y bg-brand-navy py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-brand-navy to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-brand-navy to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {items.map((h, i) => (
          <div key={i} className="flex items-center gap-3 font-mono text-sm font-semibold uppercase tracking-widest text-white/70">
            <span className="text-brand-orange">◆</span>
            {h}
            <span className="text-white/25">→ Tema</span>
          </div>
        ))}
      </div>
    </div>
  );
}
