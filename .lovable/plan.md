## NDL Cargo — Public Marketing + Ops Platform Build

Build the full marketing site alongside the existing CRM/ops app. Move the current login screen to `/auth` (keep the existing `/auth` route as-is) and turn `/` into a marketing home. Public pages are SSR-friendly with proper `head()` metadata. Existing authenticated app, RBAC, RLS, invoicing, tracking, and WhatsApp systems stay untouched.

### Brand tokens (add to `src/styles.css`)
- `--brand-orange: #F7941D` (primary action)
- `--brand-sky: #2E86DE` (secondary)
- `--brand-navy: #0F2A52` (structural)
- Typography: display = "Space Grotesk" (manifest-style headings), body = "Inter", mono = "JetBrains Mono" (tracking IDs, rates). Loaded via `<link>` in `__root.tsx` head — never `@import` remote URLs.
- Motion primitives: extend existing `useReveal` / `.reveal` and add `.magnetic`, `.tilt-hover`, `.pulse-marker` utilities. Framer Motion already installed; use it for cascading fade-ins and page transitions.

### Route map (new public routes)

```text
src/routes/
  index.tsx              → / (marketing home — hero map, quote, tracking, services teaser, lanes teaser, trust, CTA)
  services.tsx           → /services (Sea FCL/LCL, Air, Customs, Warehousing)
  lanes.tsx              → /lanes (overview grid)
  lanes.$origin.tsx      → /lanes/china | dubai | thailand | canada | us
  quote.tsx              → /quote (full freight calculator, live rates)
  tracking.tsx           → /tracking (public code lookup → milestone timeline)
  track.$code.tsx        → already exists; upgrade to show public milestones for NDL-CN-##### / NDL-GH-#####
  about.tsx              → /about (team blocks: Ops, Customs, Warehousing)
  contact.tsx            → /contact (Derby Ave address, phone, WhatsApp, embedded map)
  auth.tsx               → existing (unchanged)
```

Existing `src/routes/index.tsx` (login) → its sign-in UI moves to a small hero CTA that links to `/auth`. Auth logic itself already lives in `/auth`.

### Home (`/`) sections
1. **Hero with interactive route map**: SVG world/Africa-focused map. Lanes drawn as curved paths from Yiwu, Guangzhou, Taizhou, Dubai, Bangkok, Toronto, New York → Tema. Framer Motion animates a glowing pulse marker along each active path. Lane chips filter which arc is highlighted.
2. **Instant tracking strip**: input for `NDL-CN-#####` / `NDL-GH-#####` → routes to `/track/:code`.
3. **Freight quote engine (live)**: origin lane select, mode (Sea LCL/FCL/Air), weight (kg), dimensions (L×W×H cm) → CBM auto-calc → hits new public server fn that reads `public.rates` (add narrow `TO anon` SELECT policy on active rates) → shows chargeable rate in USD, disclaimer "indicative — final quote after confirmation", CTA to WhatsApp/Contact.
4. **Services teaser** (4 cards → `/services`).
5. **Lane intelligence teaser** (China: Yiwu / Guangzhou / Taizhou; + Dubai, Thailand, Canada, US → `/lanes`).
6. **Real-time tracking visualization**: reuse existing `MilestoneTimeline` in "demo mode" showing the 6-step lifecycle.
7. **Trust / team blocks** (Ops / Customs / Warehousing role cards).
8. **Contact strip** with Derby Avenue address, phone, floating WhatsApp button.

### Interactive tracking (public)
- Extend `/track/:code` to call a new **public** server fn `getPublicShipmentStatus(code)` that reads `shipments` by `ndl_reference` and returns only: reference, current_milestone, origin_city, destination_city, eta, eta_last_changed_at — no customer PII, no packages. Add a narrow `TO anon` SELECT policy on `shipments` limited to those columns via a `SECURITY DEFINER` function (avoid broad anon grants).
- Show `MilestoneTimeline` + ETA card. Fallback to existing "not available" state.

### Quote engine data path
- New public server fn `getIndicativeRate({ origin, mode, weightKg, cbm })`: uses server publishable client, reads `public.rates` where `active = true` filtered by origin/mode, picks the higher of KG and CBM (mirrors `price_package_line` logic).
- Policy: `GRANT SELECT ON public.rates TO anon` with RLS policy `USING (active = true)`.
- Fallback: if no rate matches, show "Contact us for a quote".

### Motion + UX system
- Global scroll-reveal via existing `useReveal` (cascade with staggered delays).
- Page transitions: Framer Motion `AnimatePresence` in `__root.tsx` around `<Outlet />` (fade+slide, respects `prefers-reduced-motion`).
- Buttons: magnetic hover, focus rings using `--brand-orange`.
- Mobile: sticky bottom-thumb nav on marketing pages, accordion for lane details and FAQ.
- Floating WhatsApp widget component (bottom-right, uses existing `openWhatsApp` helper with `0500229352`).

### Contact + trust content (hardcoded)
- Office: Derby Avenue, Ferro Bel Plaza, Accra
- Phone / WhatsApp: 0500229352
- Email: info@ndlgh.com
- JSON-LD LocalBusiness schema on `/contact` and home.

### SEO
- Distinct `head()` per public route with title (<60), description (<160), og:title, og:description, og:type, twitter:card. `og:image` only on leaves that have a real absolute hero image URL.

### Verification (the one thing added to ops)
- Add a targeted check in `src/routes/_authenticated/shipments.tsx` around `advanceStatus.onSuccess`: before enqueueing a WhatsApp draft, assert that the resolved customer list comes strictly from `shipment_packages → packages.customer_id` for THIS shipment, and that the selected template's location/next-step text matches `shipment.mode`. Log an ops error toast if either invariant fails. No schema change.

### Out of scope (this pass)
- Real Framer/Figma import from `wl.pb68.cn` — inspiration only, we don't lift assets.
- Blog/CMS.
- Changing existing authenticated dashboards, invoicing, or RBAC.

### Technical notes
- No `react-router-dom`. All routes use `createFileRoute`.
- Public server fns use the server publishable client pattern (no `requireSupabaseAuth`), read `process.env.SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` inside handlers.
- Migrations: (1) narrow `TO anon` SELECT policy on `public.rates` for active rows with `GRANT SELECT ... TO anon`; (2) `SECURITY DEFINER` function `get_public_shipment_status(_ref text)` returning the safe columns, executable by `anon`.
- Fonts loaded via `<link rel="preconnect">` + `<link rel="stylesheet">` in `__root.tsx` head.
- All new colors declared as design tokens; components use semantic classes (`bg-brand-orange`, `text-brand-navy`) — no hardcoded hex.

Ready to build on approval.