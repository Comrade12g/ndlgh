import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Stylized world route map — animated arcs, glowing pulses, twinkling stars,
 * ripple rings on hubs, auto-cycling active lane.
 */

type Lane = {
  id: string;
  label: string;
  hub: string;
  from: { x: number; y: number };
  path: string;
};

// Tema roughly at lon 0, lat 5.6 → viewBox (500, 285)
const TEMA = { x: 500, y: 285 };

function arc(x1: number, y1: number, curveY = -80): string {
  const cx = (x1 + TEMA.x) / 2;
  const cy = (y1 + TEMA.y) / 2 + curveY;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${TEMA.x} ${TEMA.y}`;
}

const LANES: Lane[] = [
  { id: "yiwu",       label: "Yiwu → Tema",       hub: "Yiwu, China",     from: { x: 810, y: 210 }, path: arc(810, 210, -110) },
  { id: "guangzhou",  label: "Guangzhou → Tema",  hub: "Guangzhou, China",from: { x: 800, y: 230 }, path: arc(800, 230, -70) },
  { id: "taizhou",    label: "Taizhou → Tema",    hub: "Taizhou, China",  from: { x: 830, y: 200 }, path: arc(830, 200, -140) },
  { id: "dubai",      label: "Dubai → Tema",      hub: "Dubai, UAE",      from: { x: 645, y: 245 }, path: arc(645, 245, -60) },
  { id: "bangkok",    label: "Bangkok → Tema",    hub: "Bangkok, Thailand",from:{ x: 760, y: 260 }, path: arc(760, 260, -90) },
  { id: "toronto",    label: "Toronto → Tema",    hub: "Toronto, Canada", from: { x: 275, y: 175 }, path: arc(275, 175, -70) },
  { id: "newyork",    label: "New York → Tema",   hub: "New York, USA",   from: { x: 295, y: 200 }, path: arc(295, 200, -40) },
];

// Deterministic pseudo-random stars
const STARS = Array.from({ length: 40 }).map((_, i) => {
  const seed = (i + 1) * 9301 + 49297;
  const x = (seed * 233 % 1000);
  const y = ((seed * 91) % 260);
  const r = 0.6 + ((seed % 7) / 10);
  const d = ((seed % 23) / 10);
  return { x, y, r, d };
});

export function HeroMap() {
  const [active, setActive] = useState<string>("yiwu");
  const [paused, setPaused] = useState(false);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLen, setPathLen] = useState(0);

  const activeLane = LANES.find((l) => l.id === active) ?? LANES[0];

  // Auto-cycle
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((cur) => {
        const idx = LANES.findIndex((l) => l.id === cur);
        return LANES[(idx + 1) % LANES.length].id;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [paused]);

  // Measure the active path for the draw-in animation
  useEffect(() => {
    if (!pathRef.current) return;
    try {
      setPathLen(pathRef.current.getTotalLength());
    } catch {
      setPathLen(1000);
    }
  }, [active]);

  const drawKey = useMemo(() => `${active}-${pathLen}`, [active, pathLen]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {LANES.map((l) => (
          <button
            key={l.id}
            onClick={() => setActive(l.id)}
            className={cn(
              "group relative rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
              active === l.id
                ? "border-brand-orange bg-brand-orange text-white shadow-md shadow-brand-orange/40"
                : "border-white/25 bg-white/5 text-white/80 hover:border-brand-orange/60 hover:text-white",
            )}
          >
            {l.hub}
            {active === l.id && (
              <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-orange/60 ripple" />
            )}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-navy via-[#0f2e63] to-brand-navy shadow-2xl">
        <svg viewBox="0 0 1000 500" className="block h-auto w-full">
          <defs>
            <radialGradient id="oceanGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(46,134,222,0.35)" />
              <stop offset="100%" stopColor="rgba(15,42,82,0)" />
            </radialGradient>
            <linearGradient id="laneGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#F7941D" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#F7941D" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FDB760" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1000" height="500" fill="url(#oceanGrad)" />

          {/* Twinkling stars over ocean/sky */}
          <g fill="#ffffff">
            {STARS.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.r}
                className="twinkle"
                style={{ animationDelay: `${s.d}s`, opacity: 0.35 }}
              />
            ))}
          </g>

          {/* Simplified world continents */}
          <g fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" strokeWidth="0.5">
            <path d="M120,120 L280,110 L340,150 L360,220 L300,260 L220,255 L170,220 L130,180 Z" />
            <path d="M300,290 L360,290 L370,360 L340,420 L310,410 L295,360 Z" />
            <path d="M460,130 L560,120 L590,170 L560,210 L495,215 L470,180 Z" />
            <path d="M470,220 L580,220 L595,300 L560,380 L520,410 L490,380 L470,320 Z" />
            <path d="M590,120 L860,110 L900,180 L870,240 L780,260 L680,235 L610,200 Z" />
            <path d="M760,260 L830,265 L820,300 L780,300 Z" />
            <path d="M830,340 L910,340 L920,390 L860,410 L825,380 Z" />
          </g>

          {/* Inactive lanes (thin dashed) */}
          {LANES.filter((l) => l.id !== active).map((l) => (
            <path
              key={l.id}
              d={l.path}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
          ))}

          {/* Active lane — draw-in halo */}
          <path
            key={`halo-${drawKey}`}
            d={activeLane.path}
            fill="none"
            stroke="url(#laneGrad)"
            strokeWidth="3"
            filter="url(#glow)"
            strokeDasharray={pathLen || 1000}
            strokeDashoffset={pathLen || 1000}
            style={{
              animation: pathLen ? `draw-in 1.2s cubic-bezier(.2,.7,.2,1) forwards` : undefined,
            }}
          />
          {/* Solid draw-in stroke */}
          <path
            ref={pathRef}
            key={`solid-${drawKey}`}
            d={activeLane.path}
            fill="none"
            stroke="#F7941D"
            strokeWidth="1.6"
            strokeDasharray={pathLen || 1000}
            strokeDashoffset={pathLen || 1000}
            style={{
              animation: pathLen ? `draw-in 1.2s cubic-bezier(.2,.7,.2,1) forwards` : undefined,
            }}
          />
          {/* Dashed flowing overlay for movement */}
          <path
            d={activeLane.path}
            fill="none"
            stroke="#FDB760"
            strokeWidth="1.2"
            strokeDasharray="8 10"
            opacity="0.8"
            className="animate-dash"
          />

          {/* Inline keyframe for draw-in */}
          <style>{`@keyframes draw-in { to { stroke-dashoffset: 0 } }`}</style>

          {/* Origin hubs */}
          {LANES.map((l) => (
            <g key={l.id} onClick={() => setActive(l.id)} style={{ cursor: "pointer" }}>
              <circle
                cx={l.from.x}
                cy={l.from.y}
                r={active === l.id ? 6 : 3.5}
                fill={active === l.id ? "#F7941D" : "rgba(255,255,255,0.55)"}
                filter={active === l.id ? "url(#glow)" : undefined}
              />
              {active === l.id && (
                <>
                  <circle cx={l.from.x} cy={l.from.y} r="10" fill="none" stroke="#F7941D" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="6;18;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={l.from.x} cy={l.from.y} r="10" fill="none" stroke="#FDB760" strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" values="6;24;6" dur="2.6s" repeatCount="indefinite" begin="0.6s" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" begin="0.6s" />
                  </circle>
                </>
              )}
            </g>
          ))}

          {/* Destination: Tema */}
          <g>
            <circle cx={TEMA.x} cy={TEMA.y} r="7" fill="#2E86DE" filter="url(#glow)" />
            <circle cx={TEMA.x} cy={TEMA.y} r="14" fill="none" stroke="#2E86DE" strokeWidth="1.5" opacity="0.6">
              <animate attributeName="r" values="8;22;8" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <text x={TEMA.x + 12} y={TEMA.y + 4} fill="#ffffff" fontSize="12" fontWeight="700">
              Tema, Ghana
            </text>
          </g>

          {/* Multiple pulse packets traveling along the path */}
          <circle r="5" fill="#ffffff" filter="url(#glow)">
            <animateMotion dur="6s" repeatCount="indefinite" path={activeLane.path} />
          </circle>
          <circle r="3.5" fill="#FDB760" filter="url(#softGlow)">
            <animateMotion dur="6s" repeatCount="indefinite" path={activeLane.path} begin="-2s" />
          </circle>
          <circle r="2.8" fill="#FFFFFF" opacity="0.75">
            <animateMotion dur="6s" repeatCount="indefinite" path={activeLane.path} begin="-4s" />
          </circle>
        </svg>

        <div className="absolute bottom-3 left-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
          Active lane: <span className="font-semibold text-brand-orange">{activeLane.label}</span>
        </div>
        <div className="absolute right-4 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
          {paused ? "Paused" : "Auto-cycling"}
        </div>
      </div>
    </div>
  );
}
