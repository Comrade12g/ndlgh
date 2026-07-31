import { memo } from "react";
import { cn } from "@/lib/utils";

/**
 * AnimatedBackdrop — lightweight, GPU-friendly animated freight scene used
 * behind dark marketing/tracking hero sections. Pure CSS/SVG, no images.
 */
export const AnimatedBackdrop = memo(function AnimatedBackdrop({
  className,
  variant = "sea",
}: {
  className?: string;
  variant?: "sea" | "air";
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {/* Soft radial glows */}
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-sky/20 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl" />

      {/* Route grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" preserveAspectRatio="none">
        <defs>
          <pattern id="ab-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ab-grid)" />
      </svg>

      {/* Dashed flight/sailing arcs */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
        {[
          { d: "M-40 320 C 250 160, 700 300, 1240 120", delay: "0s" },
          { d: "M-40 240 C 320 380, 780 80, 1240 220", delay: "-3s" },
          { d: "M-40 120 C 380 40, 820 260, 1240 60", delay: "-6s" },
        ].map((a, i) => (
          <g key={i}>
            <path d={a.d} fill="none" stroke="#2E86DE" strokeOpacity="0.28" strokeWidth="1.5" />
            <path
              d={a.d}
              fill="none"
              stroke="#F58220"
              strokeOpacity="0.75"
              strokeWidth="2"
              strokeDasharray="10 260"
              style={{ animation: `dash-flow 9s linear infinite`, animationDelay: a.delay }}
            />
          </g>
        ))}
      </svg>

      {/* Drifting vessels / planes */}
      {variant === "sea" ? (
        <>
          <Vessel className="bottom-8 h-6 w-16 opacity-70" duration="34s" delay="0s" />
          <Vessel className="bottom-20 h-4 w-11 opacity-45" duration="52s" delay="-12s" />
          <Vessel className="bottom-2 h-3 w-9 opacity-30" duration="68s" delay="-30s" />
        </>
      ) : (
        <>
          <Plane className="top-10 opacity-70" duration="26s" delay="0s" />
          <Plane className="top-24 opacity-40" duration="44s" delay="-10s" />
        </>
      )}

      {/* Waves */}
      <svg
        className="absolute inset-x-0 bottom-0 h-16 w-full text-white/10"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 40c120-26 240-26 360 0s240 26 360 0 240-26 360 0 240 26 360 0v40H0z"
          style={{ animation: "wave-shift 12s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
});

function Vessel({ className, duration, delay }: { className?: string; duration: string; delay: string }) {
  return (
    <div
      className={cn("absolute left-0", className)}
      style={{ animation: `sail-right ${duration} linear infinite`, animationDelay: delay }}
    >
      <svg viewBox="0 0 64 24" className="h-full w-full text-white">
        <rect x="8" y="14" width="44" height="6" rx="1.5" fill="currentColor" fillOpacity="0.9" />
        <rect x="16" y="8" width="8" height="6" fill="#F58220" />
        <rect x="26" y="6" width="8" height="8" fill="currentColor" fillOpacity="0.7" />
        <rect x="36" y="9" width="8" height="5" fill="#F58220" fillOpacity="0.8" />
        <path d="M6 20h52l-6 4H12z" fill="currentColor" fillOpacity="0.55" />
      </svg>
    </div>
  );
}

function Plane({ className, duration, delay }: { className?: string; duration: string; delay: string }) {
  return (
    <div
      className={cn("absolute left-0", className)}
      style={{ animation: `sail-right ${duration} linear infinite`, animationDelay: delay }}
    >
      <svg viewBox="0 0 48 24" className="h-4 w-10 text-white">
        <path d="M2 13l40-6-8 10-6 1-4 5-3-1 1-5-20-4z" fill="currentColor" fillOpacity="0.9" />
      </svg>
    </div>
  );
}
