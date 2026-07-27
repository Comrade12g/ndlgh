# Visual & Interactive Upgrade — NDL Marketing Site

Layer premium, brand-aligned motion and interactivity onto the existing marketing pages without touching CRM logic. All work stays in `src/routes/*.tsx`, `src/components/marketing/*`, and `src/styles.css`. Brand tokens (Orange #F7941D, Sky #2E86DE, Navy #0F2A52) and the logo stay untouched.

## 1. Hero — cinematic upgrade (`src/routes/index.tsx`, `HeroMap.tsx`)
- Parallax layered background: slow-drifting navy gradient blobs, subtle grid, floating container silhouettes reacting to mouse position (transform on `mousemove`, throttled with rAF).
- Upgrade `HeroMap`:
  - Animated great-circle arcs drawn with SVG `stroke-dasharray` + `stroke-dashoffset` on lane switch (draw-in effect).
  - Multiple simultaneous pulse packets per lane (staggered `animateMotion`), not just one.
  - Twinkling star field over the ocean, soft cloud drift layer.
  - Hub chips get magnetic hover (translate toward cursor), active hub emits ripple rings.
  - Auto-cycle active lane every 5s unless user interacts (pause on hover).
- Kinetic headline: word-by-word fade/rise using CSS `@keyframes` staggered via inline `animation-delay`.
- Trust strip: count-up numbers (already have `useCountUp`) + animated icon on scroll.

## 2. Global scroll & micro-interactions (`src/styles.css`, `use-reveal.ts`)
- Add reveal variants: `reveal-left`, `reveal-right`, `reveal-scale`, `reveal-blur`. Cascade children with `[data-stagger]` using CSS custom-property delays.
- Add `.magnetic` utility (JS hook `useMagnetic` for buttons/cards).
- Add `.tilt-card` (3D tilt on mouse over via CSS `transform: perspective()` driven by pointer coords).
- Marquee band of origin hub names between sections (infinite scroll, CSS-only).

## 3. Services section — interactive cards
- Replace static cards with flip/tilt cards: front shows icon+name, back reveals bullet capabilities on hover/tap.
- Animated SVG glyphs per service (ship bobbing, plane takeoff, truck rolling wheels, warehouse shutter) — pure SVG + CSS keyframes.

## 4. Lanes section — interactive globe strip
- Horizontal scroll-snap rail of lane cards with cover imagery gradients per origin.
- On hover: reveal micro-map thumbnail (reuse `HeroMap` mini variant) + KPI counters (transit days, weekly departures).
- "Compare lanes" toggle: pick 2 lanes, side-by-side stat bars animate in.

## 5. Quote engine — live visualization (`QuoteEngine.tsx`)
- As user types weight/CBM, a 3D-looking box (CSS transforms) resizes proportionally.
- Chargeable-weight bar chart animates between volumetric vs actual with spring easing.
- Currency total tickers using count-up on change.

## 6. Tracking demo — animated milestone rail
- Milestone timeline: pulsing dot on current stage, progress line fills with gradient, truck/ship icon glides along the rail (`offset-path`).
- Confetti-free "delivered" state shows a soft check burst.

## 7. Testimonials + stats band (new section on home)
- Auto-rotating testimonial carousel with drag/swipe (Embla-style; use existing embla-carousel dep if present, else CSS scroll-snap).
- Global stats: CBM shipped, containers cleared, cities delivered — count-up on view.

## 8. Contact & CTA
- Contact page: interactive Accra map card (static styled SVG of Accra with pin bounce on Derby Ave), WhatsApp/phone/email tiles with hover glow.
- Floating WhatsApp: add attention nudge (subtle bounce every 8s, tooltip "Chat with us").

## 9. Motion discipline
- All animations honor `prefers-reduced-motion: reduce` (disable transforms, keep opacity).
- Reuse existing `reveal`, `animate-dash`, sail/fly keyframes; add new ones only where needed.
- No new heavy deps; use CSS + SVG + light rAF hooks. (Framer Motion only if a specific card needs layout animation — flagged below.)

## Technical section
- Files edited: `src/routes/index.tsx`, `src/components/marketing/HeroMap.tsx`, `src/components/marketing/QuoteEngine.tsx`, `src/components/tracking/MilestoneTimeline.tsx`, `src/components/marketing/MarketingLayout.tsx`, `src/hooks/use-reveal.ts`, `src/styles.css`, `src/routes/services.tsx`, `src/routes/lanes.tsx`, `src/routes/contact.tsx`.
- New files: `src/hooks/use-magnetic.ts`, `src/hooks/use-tilt.ts`, `src/components/marketing/StatsBand.tsx`, `src/components/marketing/Testimonials.tsx`, `src/components/marketing/LaneCompare.tsx`, `src/components/marketing/ServiceGlyphs.tsx`.
- No DB, RLS, or server-function changes. No routing changes. CRM untouched.

## Out of scope
- Video backgrounds (bandwidth cost for Ghana mobile users).
- Three.js/WebGL globe (weight); we stick with SVG for performance.

Approve and I'll implement in one build pass.
