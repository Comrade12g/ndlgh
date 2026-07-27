import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout, NDL_ADDRESS, NDL_EMAIL, NDL_PHONE } from "@/components/marketing/MarketingLayout";
import { HeroMap } from "@/components/marketing/HeroMap";
import { QuoteEngine } from "@/components/marketing/QuoteEngine";
import { TrackingLookup } from "@/components/marketing/TrackingLookup";
import { MilestoneTimeline } from "@/components/tracking/MilestoneTimeline";
import { StatsBand } from "@/components/marketing/StatsBand";
import { Testimonials } from "@/components/marketing/Testimonials";
import { LaneMarquee } from "@/components/marketing/LaneMarquee";
import { HeroCarousel, type CarouselSlide } from "@/components/marketing/HeroCarousel";
import { SmartImage } from "@/components/marketing/SmartImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useTilt } from "@/hooks/use-tilt";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  fetchActiveGallery, FALLBACK_GALLERY, FALLBACK_HERO_SLIDES, GALLERY_CATEGORIES,
  type GalleryPhoto,
} from "@/lib/gallery";
import {
  Ship, Plane, Truck, Warehouse, ShieldCheck, Globe2,
  ArrowRight, Users, FileCheck, Filter,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NDL Cargo Ghana — Sea, Air & Door Freight from China, Dubai, US, Canada & Thailand" },
      { name: "description", content: "NDL Cargo Ghana ships sea LCL/FCL, air cargo and door-to-door freight from China (Guangzhou, Yiwu, Shenzhen), Dubai, Thailand, Canada and the US into Tema Port and Accra. Live NDL-CN & NDL-GH tracking, in-house customs clearing, groupage consolidation and Ghana-wide last-mile delivery. Get an instant CBM quote in seconds." },
      { name: "keywords", content: "shipping to Ghana, China to Ghana cargo, Guangzhou Yiwu Ghana freight, Dubai to Ghana shipping, air cargo Ghana, sea freight Tema, LCL FCL Ghana, customs clearing Tema, Ghana logistics, last-mile delivery Ghana, NDL Cargo, groupage Ghana" },
      { property: "og:title", content: "NDL Cargo Ghana — Global freight, delivered to your door" },
      { property: "og:description", content: "Sea LCL/FCL, air, customs clearing and Ghana-wide last-mile delivery from China, Dubai, Thailand, Canada and the US. Instant quotes and live shipment tracking." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1600&q=80" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1600&q=80" },
    ],
  }),
  component: HomePage,
});

const LANES = [
  { code: "china", name: "China", tag: "Yiwu · Guangzhou · Taizhou", note: "Small commodities, electronics, hardware", photo: "https://images.unsplash.com/photo-1545893835-abaa50cbe628?auto=format&fit=crop&w=800&q=65" },
  { code: "dubai", name: "Dubai", tag: "UAE hub", note: "Cosmetics, gold, machinery", photo: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=65" },
  { code: "thailand", name: "Thailand", tag: "Bangkok", note: "Auto parts, wellness, food", photo: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=65" },
  { code: "canada", name: "Canada", tag: "Toronto", note: "Personal effects, retail returns", photo: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800&q=65" },
  { code: "us", name: "United States", tag: "New York · Los Angeles", note: "E-commerce, vehicles, machinery", photo: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=65" },
];

const SERVICES = [
  { icon: Ship, name: "Sea Freight", desc: "LCL groupage and full-container (FCL) service to Tema Port.", photo: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=65" },
  { icon: Plane, name: "Air Cargo", desc: "Express and general air freight into Kotoka International.", photo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=65" },
  { icon: FileCheck, name: "Customs Clearing", desc: "In-house licensed brokers — no third-party leakage.", photo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=65" },
  { icon: Warehouse, name: "Warehousing & Delivery", desc: "Bonded storage plus Ghana-wide last-mile delivery.", photo: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=65" },
];

const GALLERY = [
  { src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=65", alt: "Container ship at port" },
  { src: "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=800&q=65", alt: "Warehouse interior" },
  { src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=65", alt: "Cargo plane on tarmac" },
  { src: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=800&q=65", alt: "Delivery truck" },
  { src: "https://images.unsplash.com/photo-1577032229840-33f74d0ab24e?auto=format&fit=crop&w=800&q=65", alt: "Stacked containers" },
  { src: "https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?auto=format&fit=crop&w=800&q=65", alt: "Port cranes at dusk" },
];

function HomePage() {
  return (
    <MarketingLayout>
      <Hero />
      <LaneMarquee />
      <TrustStrip />
      <ServicesSection />
      <StatsBand />
      <QuoteSection />
      <LanesSection />
      <GallerySection />
      <TrackingDemo />
      <Testimonials />
      <TeamSection />
      <ContactCTA />
      <JsonLd />
    </MarketingLayout>
  );
}

function useGalleryPhotos() {
  return useQuery({
    queryKey: ["public-gallery"],
    queryFn: fetchActiveGallery,
    staleTime: 5 * 60_000,
  });
}

function heroSlidesFromDb(photos: GalleryPhoto[] | undefined): CarouselSlide[] {
  const hero = (photos ?? []).filter((p) => p.is_hero);
  if (hero.length > 0) {
    return hero.map((p) => ({
      src: p.image_url,
      alt: p.title,
      caption: p.title,
      location: p.location ?? undefined,
    }));
  }
  return FALLBACK_HERO_SLIDES;
}

function GallerySection() {
  const ref = useReveal<HTMLDivElement>();
  const { data } = useGalleryPhotos();
  const [category, setCategory] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");

  const items = useMemo(() => {
    const fromDb = (data ?? []).map((p) => ({
      src: p.image_url,
      alt: p.title,
      category: p.category,
      location: p.location ?? "",
    }));
    return fromDb.length > 0 ? fromDb : FALLBACK_GALLERY;
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) if (it.category) set.add(it.category);
    return Array.from(set);
  }, [items]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) if (it.location) set.add(it.location);
    return Array.from(set);
  }, [items]);

  const filtered = items.filter((it) =>
    (category === "all" || it.category === category) &&
    (location === "all" || it.location === location),
  );

  return (
    <section className="bg-secondary/40 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div ref={ref} className="reveal">
          <SectionHeading eyebrow="On the ground" title="From origin port to your door — every step covered" />
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Real photos from our warehouses in Guangzhou and Yiwu, sea and air lanes into Ghana, and last-mile deliveries in Accra, Kumasi and Tema. Filter by service or city.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-sm">
            <Filter className="h-3.5 w-3.5 text-brand-orange" /> Filter
          </div>
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>All services</FilterChip>
          {GALLERY_CATEGORIES.filter((c) => categories.includes(c)).map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterChip>
          ))}
          {locations.length > 0 && (
            <>
              <div className="mx-2 h-4 w-px bg-border" />
              <FilterChip active={location === "all"} onClick={() => setLocation("all")}>All cities</FilterChip>
              {locations.map((l) => (
                <FilterChip key={l} active={location === l} onClick={() => setLocation(l)}>{l}</FilterChip>
              ))}
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((g, i) => (
            <GalleryTile key={g.src + i} item={g} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No photos match the current filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const CATEGORY_SEO: Record<string, { verb: string; keyword: string }> = {
  "Warehouse": { verb: "at", keyword: "NDL Cargo bonded warehouse & groupage consolidation" },
  "Port & Vessels": { verb: "at", keyword: "sea freight LCL/FCL container operations" },
  "Air Cargo": { verb: "at", keyword: "air cargo freight into Ghana" },
  "Customs": { verb: "at", keyword: "licensed customs clearing & duty processing" },
  "Delivery": { verb: "in", keyword: "Ghana-wide last-mile cargo delivery" },
  "Team": { verb: "in", keyword: "NDL Cargo logistics team on the ground" },
  "Origin Hubs": { verb: "at", keyword: "China & Dubai origin sourcing hub" },
  "Other": { verb: "in", keyword: "NDL Cargo shipping operations" },
};

function buildGalleryCopy(item: { alt: string; category?: string; location?: string }) {
  const meta = (item.category && CATEGORY_SEO[item.category]) || CATEGORY_SEO["Other"];
  const city = item.location?.trim();
  const where = city ? `${meta.verb} ${city}` : "";
  const base = item.alt?.trim() || meta.keyword;
  // SEO-friendly alt: description + service + city + brand context
  const alt = [
    base,
    "—",
    meta.keyword,
    where,
    "| NDL Cargo Ghana",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const caption = city ? `${base} · ${city}` : base;
  const sub = item.category
    ? city
      ? `${item.category} • ${city}`
      : item.category
    : city || "";
  return { alt, caption, sub };
}

function GalleryTile({
  item,
  index,
}: {
  item: { src: string; alt: string; category?: string; location?: string };
  index: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  const { alt, caption, sub } = buildGalleryCopy(item);
  return (
    <figure
      ref={ref}
      className="reveal group relative aspect-square overflow-hidden rounded-2xl"
      style={{ transitionDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <SmartImage
        src={item.src}
        alt={alt}
        className="h-full w-full"
        imgClassName="transition-transform duration-700 group-hover:scale-110"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
        <div className="text-xs font-semibold leading-tight">{caption}</div>
        {sub && <div className="mt-0.5 text-[10px] font-normal text-white/80">{sub}</div>}
      </figcaption>
    </figure>
  );
}




function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand-navy text-white shadow"
          : "bg-white text-brand-navy hover:bg-brand-orange hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Hero() {
  const ref = useReveal<HTMLDivElement>();
  const magneticA = useMagnetic<HTMLDivElement>(0.18);
  const magneticB = useMagnetic<HTMLDivElement>(0.18);
  const { data: photos } = useGalleryPhotos();
  const slides = useMemo(() => heroSlidesFromDb(photos), [photos]);
  const headline = "Global freight, delivered to your door in Ghana.".split(" ");
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-navy via-[#0d2551] to-brand-navy text-white">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 25% 30%, rgba(247,148,29,0.35), transparent 40%), radial-gradient(circle at 75% 60%, rgba(46,134,222,0.35), transparent 45%)" }} />
      <div className="absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl animate-float-y" />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-brand-sky/15 blur-3xl animate-float-y" style={{ animationDelay: "-3s" }} />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div ref={ref} className="reveal">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-orange backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" /> Live network · 5 origin hubs
          </div>
          <h1 className="mt-5 word-rise font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {headline.map((w, i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 90}ms` }}
                className={w === "delivered" ? "text-gradient-brand mr-2" : "mr-2"}
              >
                {w}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/80">
            Sea groupage, full containers, air cargo, customs clearing and Ghana-wide last-mile delivery — from China, Dubai, Thailand, Canada and the US.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div ref={magneticA} className="inline-block">
              <Link to="/quote">
                <Button size="lg" className="bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:bg-brand-orange/90 hover:scale-105 transition-transform">
                  Get an instant quote <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div ref={magneticB} className="inline-block">
              <Link to="/tracking">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:scale-105 transition-transform">
                  Track a shipment
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8">
            <TrackingLookup variant="hero" />
          </div>
        </div>
        <div className="reveal-scale space-y-4">
          <HeroCarousel slides={slides} />
          <HeroMap />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Globe2, k: "5", label: "origin hubs" },
    { icon: Ship, k: "24/7", label: "shipment tracking" },
    { icon: ShieldCheck, k: "In-house", label: "customs clearing" },
    { icon: Truck, k: "Ghana-wide", label: "last-mile delivery" },
  ];
  return (
    <section className="border-b bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-orange/10 p-2.5 text-brand-orange">
              <it.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-brand-navy">{it.k}</div>
              <div className="text-xs text-muted-foreground">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div ref={ref} className="reveal">
        <SectionHeading eyebrow="Services" title="What we ship, end-to-end" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s, i) => (
          <RevealCard key={s.name} delay={i * 80} noPadding>
            <div className="relative h-40 overflow-hidden">
              <img
                src={s.photo}
                alt={s.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />
              <div className="absolute left-4 top-4 rounded-lg bg-white/95 p-2 text-brand-orange shadow-lg">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg font-bold text-brand-navy">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </RevealCard>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/services">
          <Button variant="outline">Explore all services <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    </section>
  );
}

function QuoteSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-secondary/40 py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
        <div ref={ref} className="reveal">
          <SectionHeading eyebrow="Instant quote" title="Know your freight cost in seconds" />
          <p className="mt-4 max-w-md text-muted-foreground">
            Enter weight and dimensions — we calculate CBM automatically and pick the chargeable weight against live tariffs.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Live rate lookup, no waiting for email replies",
              "Auto CBM from length × width × height × pieces",
              "Whichever costs more: chargeable weight or volume",
              "One tap to confirm on WhatsApp",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-brand-orange" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal">
          <QuoteEngine />
        </div>
      </div>
    </section>
  );
}

function LanesSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div ref={ref} className="reveal">
        <SectionHeading eyebrow="Lane intelligence" title="Origins we operate every week" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANES.map((l, i) => (
          <Link key={l.code} to="/lanes/$origin" params={{ origin: l.code }} className="group block">
            <RevealCard delay={i * 60} noPadding className="transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={l.photo}
                  alt={l.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-black">{l.name}</h3>
                    <ArrowRight className="h-4 w-4 text-brand-orange transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-brand-orange">{l.tag}</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">{l.note}</p>
              </div>
            </RevealCard>
          </Link>
        ))}
      </div>

    </section>
  );
}

function TrackingDemo() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-brand-navy py-16 text-white md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div ref={ref} className="reveal text-center">
          <div className="inline-flex rounded-full bg-brand-orange/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-orange">
            Live tracking
          </div>
          <h2 className="mt-4 font-display text-3xl font-black md:text-4xl">
            Every shipment, every stage
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/70">
            Track your NDL-CN-##### or NDL-GH-##### reference through the full lifecycle — right up to your doorstep.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-white/15 bg-white/95 p-6 text-foreground shadow-2xl">
          <MilestoneTimeline current="in_transit" />
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <TrackingLookup variant="page" />
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const ref = useReveal<HTMLDivElement>();
  const teams = [
    { icon: Users, name: "Operations", desc: "Warehouse intake, groupage consolidation and shipment planning." },
    { icon: FileCheck, name: "Customs", desc: "Licensed in-house brokerage — GRA and port compliance." },
    { icon: Warehouse, name: "Warehousing", desc: "Bonded storage at Tema and Accra with last-mile dispatch." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div ref={ref} className="reveal">
        <SectionHeading eyebrow="Team" title="Who moves your cargo" />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {teams.map((t, i) => (
          <RevealCard key={t.name} delay={i * 80}>
            <div className="rounded-lg bg-brand-sky/10 p-2.5 w-fit text-brand-sky">
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-brand-navy">{t.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
          </RevealCard>
        ))}
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-orange via-[#f0862a] to-brand-orange p-10 text-white md:p-14">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-3xl font-black md:text-4xl">Ready to ship?</h2>
            <p className="mt-2 max-w-xl text-white/90">
              Speak to the NDL team at {NDL_ADDRESS}. Call {NDL_PHONE} or email {NDL_EMAIL}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact"><Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">Contact us</Button></Link>
            <Link to="/quote"><Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10">Get a quote</Button></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">{eyebrow}</div>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-brand-navy md:text-4xl">{title}</h2>
    </div>
  );
}

function RevealCard({ children, delay = 0, className = "", tilt = true, noPadding = false }: { children: React.ReactNode; delay?: number; className?: string; tilt?: boolean; noPadding?: boolean }) {
  const ref = useReveal<HTMLDivElement>();
  const tiltRef = useTilt<HTMLDivElement>(8);
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      <div ref={tilt ? tiltRef : undefined}>
        <Card className={`${noPadding ? "overflow-hidden" : "p-6"} transition-shadow hover:shadow-xl ${className}`}>{children}</Card>
      </div>
    </div>
  );
}

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "NDL Cargo Ghana",
    image: "https://ndlgh.susuboxgh.com/favicon.png",
    address: { "@type": "PostalAddress", streetAddress: NDL_ADDRESS, addressLocality: "Accra", addressCountry: "GH" },
    telephone: NDL_PHONE,
    email: NDL_EMAIL,
    url: "https://ndlgh.com",
    areaServed: "Ghana",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
