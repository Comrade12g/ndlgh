import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo, LogoLockup } from "@/components/brand/Logo";
import { useCountUp, useReveal } from "@/hooks/use-reveal";
import {
  PackageSearch,
  Ship,
  Container,
  Plane,
  Truck,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
  Wallet,
  ShoppingBag,
  Radar,
  Globe2,
  Star,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

/* ---------- helpers ---------- */

function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useReveal<HTMLElement>();
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref as never}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Comp>
  );
}

function Stat({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const { ref, value } = useCountUp(end);
  return (
    <div className="text-center md:text-left">
      <div className="font-display text-4xl font-extrabold text-white md:text-5xl">
        <span ref={ref}>{value.toLocaleString()}</span>
        <span className="text-brand-orange">{suffix}</span>
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/70">
        {label}
      </div>
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/85 shadow-[0_6px_24px_-18px_rgba(10,46,92,.4)] backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <LogoLockup compact />
        <nav
          className={`hidden items-center gap-7 text-sm font-medium md:flex ${
            scrolled ? "text-foreground/80" : "text-white/90"
          }`}
        >
          <a href="#services" className="hover:text-brand-orange">Services</a>
          <a href="#features" className="hover:text-brand-orange">Platform</a>
          <a href="#track" className="hover:text-brand-orange">Track</a>
          <a href="#how" className="hover:text-brand-orange">How it works</a>
          <a href="#contact" className="hover:text-brand-orange">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" search={{ mode: "signin" } as never}>
            <Button
              variant="ghost"
              className={scrolled ? "text-brand-navy hover:text-brand-orange" : "text-white hover:bg-white/10 hover:text-white"}
            >
              Sign in
            </Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button className="bg-brand-orange text-white hover:bg-brand-orange/90">
              Get shipping mark
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero backdrop ---------- */

function HeroBackdrop() {
  return (
    <>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#0F2A52_0%,#123566_45%,#1B4E8F_75%,#2E86DE_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(247,148,29,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(46,134,222,0.35),transparent_60%)]" />
      <div className="absolute -right-40 top-10 -z-10 h-[500px] w-[500px] rounded-full bg-brand-orange/30 blur-3xl animate-blob" />
      <div
        className="absolute -left-40 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-brand-sky/40 blur-3xl animate-blob"
        style={{ animationDelay: "-6s" }}
      />

      {/* Route arcs */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.45]"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="routeStroke" x1="0" x2="1">
            <stop offset="0%" stopColor="#F58220" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#F58220" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F58220" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="hub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F58220" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F58220" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="M60,180 C280,60 620,60 940,220"
          fill="none"
          stroke="url(#routeStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-dash"
        />

        {[
          { x: 60, y: 180, label: "Guangzhou" },
          { x: 940, y: 220, label: "Tema, Ghana" },
        ].map((h) => (
          <g key={h.label}>
            <circle cx={h.x} cy={h.y} r="30" fill="url(#hub)" />
            <circle cx={h.x} cy={h.y} r="6" fill="#F58220" />
            <text
              x={h.x + (h.x < 500 ? 14 : -14)}
              y={h.y - 14}
              fontSize="13"
              fontWeight="700"
              fill="#ffffff"
              textAnchor={h.x < 500 ? "start" : "end"}
              opacity="0.9"
            >
              {h.label}
            </text>
          </g>
        ))}

        {/* Traveling markers */}
        <g className="marker-travel">
          <circle r="7" fill="#F58220" />
          <circle r="14" fill="#F58220" opacity="0.25" />
        </g>
        <g className="marker-travel-delayed">
          <circle r="5" fill="#ffffff" />
        </g>
      </svg>

      {/* Waves */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 w-[200%] animate-waves opacity-30"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
      >
        <path d="M0,40 C150,10 300,70 600,40 C900,10 1050,70 1200,40 L1200,80 L0,80 Z" fill="#1E7FD1" />
        <path
          d="M0,50 C150,20 300,80 600,50 C900,20 1050,80 1200,50 L1200,80 L0,80 Z"
          fill="#0A2E5C"
          opacity="0.6"
        />
      </svg>

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[62%] left-0 w-full animate-sail-right">
          <Ship className="h-9 w-9 text-white animate-bob drop-shadow-lg" strokeWidth={1.8} />
        </div>
        <div className="absolute top-[78%] left-0 w-full animate-sail-left" style={{ animationDelay: "-15s" }}>
          <Container className="h-8 w-8 text-brand-orange animate-bob drop-shadow-lg" strokeWidth={1.8} />
        </div>
        <div className="absolute top-[18%] left-0 w-full animate-fly">
          <Plane className="h-7 w-7 text-white drop-shadow-lg" strokeWidth={1.8} />
        </div>
      </div>
    </>
  );
}

/* ---------- Testimonials ---------- */

const TESTIMONIALS = [
  {
    name: "Ama Boateng",
    role: "Boutique owner, Accra",
    quote:
      "NDL sources my 1688 orders, consolidates them in Guangzhou, and drops them at my shop. I stopped babysitting suppliers.",
  },
  {
    name: "Kwesi Mensah",
    role: "Electronics importer, Kumasi",
    quote:
      "Full container from Dubai to Tema in 21 days, invoiced, cleared and delivered — the tracking is honestly better than the carriers'.",
  },
  {
    name: "Nana Yaa",
    role: "Amazon UK reseller",
    quote:
      "I ship UK returns and new stock to the London warehouse and get one weekly consolidation. FX rates are transparent every day.",
  },
  {
    name: "Selorm A.",
    role: "Ops manager, logistics agency",
    quote:
      "We moved our whole client book onto NDL's portal. Sourcing, treasury and delivery in one place — huge time saver.",
  },
];

function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            Trusted across Ghana
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-navy md:text-4xl">
            Importers, boutiques and agencies ship with NDL
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-card p-1">
            <div className="flex w-[400%] animate-carousel">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="w-1/4 shrink-0 px-6 py-10 md:px-12 md:py-14">
                  <div className="flex justify-center gap-0.5 text-brand-orange">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-center font-display text-xl leading-relaxed text-brand-navy md:text-2xl">
                    “{t.quote}”
                  </p>
                  <div className="mt-6 text-center">
                    <div className="font-semibold text-brand-navy">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

function Landing() {
  const [code, setCode] = useState("");

  const partners = useMemo(
    () => ["PIL", "MSC", "Maersk", "CMA CGM", "Emirates SkyCargo", "Ethiopian Cargo", "DHL", "GPHA Tema"],
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 md:grid-cols-2 md:py-32">
          <div className="text-white">
            <Reveal className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
              China · UK · Dubai → Ghana
            </Reveal>

            <Reveal as="h1" delay={80} className="mt-5 font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Ship the world to your{" "}
              <span className="text-gradient-brand">doorstep</span> in Ghana.
            </Reveal>

            <Reveal delay={160} className="mt-5 max-w-xl text-lg text-white/90">
              Sea groupage, full containers, air freight and intercity delivery — sourced,
              consolidated, invoiced and tracked from origin warehouse to your customer's door.
            </Reveal>

            <Reveal delay={240} className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                <Button
                  size="lg"
                  className="glow-pulse bg-brand-orange text-white hover:bg-brand-orange/90"
                >
                  Get your shipping mark <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#track">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/15"
                >
                  <PackageSearch className="mr-2 h-4 w-4" /> Track a shipment
                </Button>
              </a>
            </Reveal>

            <Reveal delay={320} className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              <Stat end={12500} suffix="+" label="Parcels moved" />
              <Stat end={1800} suffix="+" label="Active customers" />
              <Stat end={98} suffix="%" label="On-time delivery" />
            </Reveal>
          </div>

          {/* Track card */}
          <Reveal delay={200}>
            <div
              id="track"
              className="rounded-2xl border border-white/10 bg-card p-6 shadow-2xl md:p-8 lift"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
                  <PackageSearch className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-navy">
                    Track your shipment
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter tracking number or shipping mark
                  </p>
                </div>
              </div>
              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const c = code.trim();
                  if (c) window.location.href = `/track/${encodeURIComponent(c)}`;
                }}
              >
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. NDL-GH-01234 or NDL-CN-98721"
                  className="h-12 text-base"
                />
                <Button type="submit" size="lg" className="w-full bg-brand-navy hover:bg-brand-navy/90">
                  Track shipment
                </Button>
              </form>
              <div className="mt-6 rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                <div className="mb-1 font-semibold text-brand-navy">New to NDL Ghana?</div>
                Sign up to get your unique{" "}
                <span className="font-mono text-brand-orange">NDL-GH-#####</span> shipping mark and
                our overseas warehouse addresses in China, UK, and Dubai.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PARTNERS MARQUEE */}
      <section className="border-y bg-card/60">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-hidden px-4 py-6">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ports & carriers we work with
          </span>
          <div className="relative w-full overflow-hidden">
            <div className="flex w-max animate-marquee gap-12 whitespace-nowrap pr-12">
              {[...partners, ...partners].map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="font-display text-sm font-bold uppercase tracking-widest text-brand-navy/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            Our services
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-navy md:text-4xl">
            End-to-end shipping, sourcing & delivery
          </h2>
          <p className="mt-3 text-muted-foreground">
            Whether you're buying from 1688, ordering from Amazon UK, or moving a full 40ft
            container, NDL handles pickup, freight, clearing and last-mile.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Ship, title: "Sea Groupage (LCL)", desc: "Priced per CBM. Weekly consolidations from China, UK and Dubai." },
            { icon: Container, title: "Full Container (FCL)", desc: "20ft and 40ft containers direct to Tema/Takoradi port." },
            { icon: Plane, title: "Air Freight", desc: "Fast air cargo priced per kg for urgent shipments and small parcels." },
            { icon: Truck, title: "Intercity Ghana", desc: "Last-mile delivery to any city in Ghana with signature POD." },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="lift group h-full rounded-2xl border bg-card p-6 hover:border-brand-orange/50">
                <div className="mb-4 inline-flex rounded-lg bg-brand-navy/5 p-3 text-brand-navy transition-colors group-hover:bg-brand-orange/10 group-hover:text-brand-orange">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-brand-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section id="features" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#0F2A52_0%,#153b7a_100%)]" />
        <div className="absolute -right-32 top-10 -z-10 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="absolute -left-32 bottom-10 -z-10 h-96 w-96 rounded-full bg-brand-sky/30 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
              One platform, every step
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">
              Sourcing, shipping and payments in a single portal
            </h2>
            <p className="mt-3 text-white/80">
              Built for e-commerce sellers, importers and 3PL agencies moving goods into Ghana.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShoppingBag, title: "China Sourcing", desc: "Our agents source from 1688, Alibaba and Yiwu markets — you pay one invoice." },
              { icon: Radar, title: "Real-time Tracking", desc: "NDL-CN reference codes with 7-step milestones from port to your door." },
              { icon: Wallet, title: "Multi-currency Invoicing", desc: "USD, GBP, AED, CNY, GHS — daily FX rates, auto-generated at intake." },
              { icon: Globe2, title: "International Payments", desc: "Send and receive supplier payments across China, UK and Dubai." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 110}>
                <div className="lift group h-full rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm hover:border-brand-orange/60 hover:bg-white/[0.10]">
                  <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-brand-sky p-3 text-white shadow-lg shadow-brand-orange/30">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-orange opacity-0 transition-opacity group-hover:opacity-100">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            How it works
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-navy md:text-4xl">
            Four simple steps
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { n: "01", t: "Sign up", d: "Get your unique NDL-GH shipping mark and our warehouse addresses." },
            { n: "02", t: "Ship to us", d: "Send your parcels to our China, UK, or Dubai warehouse." },
            { n: "03", t: "We consolidate", d: "We weigh, measure, photograph and load your goods." },
            { n: "04", t: "Delivered", d: "Track live, pay online, and receive at your doorstep." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="lift relative h-full overflow-hidden rounded-2xl border bg-card p-6">
                <div className="absolute -right-4 -top-4 font-display text-7xl font-extrabold text-brand-orange/10">
                  {s.n}
                </div>
                <div className="font-display text-4xl font-extrabold text-brand-orange/80">{s.n}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-brand-navy">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Reveal>
          <div className="grid gap-6 rounded-2xl border bg-gradient-to-br from-brand-navy to-brand-sky p-8 text-white md:grid-cols-3 md:p-10">
            {[
              { icon: ShieldCheck, t: "Insured & tracked", d: "Every package photographed and logged." },
              { icon: MapPin, t: "3 overseas hubs", d: "Guangzhou · London · Dubai." },
              { icon: Truck, t: "Door delivery", d: "Signature-captured last-mile in Ghana." },
            ].map((s) => (
              <div key={s.t} className="flex items-start gap-4">
                <div className="rounded-lg bg-white/15 p-3">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold">{s.t}</div>
                  <div className="text-sm text-white/85">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Testimonials />

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#0F2A52_0%,#12356b_50%,#1B4E8F_100%)]" />
        <div className="absolute -right-20 -top-20 -z-10 h-96 w-96 rounded-full bg-brand-orange/30 blur-3xl animate-blob" />
        <div className="absolute -left-20 -bottom-20 -z-10 h-96 w-96 rounded-full bg-brand-sky/50 blur-3xl animate-blob" style={{ animationDelay: "-5s" }} />

        <div className="mx-auto max-w-4xl px-4 text-center text-white">
          <Reveal>
            <Logo className="mx-auto h-14 w-14" />
          </Reveal>
          <Reveal delay={80} as="h2" className="mt-6 font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Ready to move goods from{" "}
            <span className="text-gradient-brand">anywhere</span> to Ghana?
          </Reveal>
          <Reveal delay={160} className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            Get your shipping mark in 60 seconds. Ship to our warehouses today and we'll handle the
            rest — from Guangzhou to your Accra doorstep.
          </Reveal>

          <Reveal delay={240} className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              <Button size="lg" className="glow-pulse bg-brand-orange text-white hover:bg-brand-orange/90">
                Get your shipping mark <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#services">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15">
                Explore services
              </Button>
            </a>
          </Reveal>

          <Reveal delay={320} className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/80">
            {["Free sign-up", "No monthly fees", "Pay per shipment", "Cancel anytime"].map((x) => (
              <div key={x} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-orange" />
                {x}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <LogoLockup />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              NDL Ghana — Global Shipping. E-commerce, sourcing and intercity delivery.
            </p>
          </div>
          <div>
            <div className="font-display font-bold text-brand-navy">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-brand-orange">Services</a></li>
              <li><a href="#features" className="hover:text-brand-orange">Platform</a></li>
              <li><a href="#how" className="hover:text-brand-orange">How it works</a></li>
              <li>
                <Link to="/auth" search={{ mode: "signin" } as never} className="hover:text-brand-orange">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-display font-bold text-brand-navy">Contact</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Accra, Ghana</li>
              <li>hello@ndlghana.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NDL Ghana. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
