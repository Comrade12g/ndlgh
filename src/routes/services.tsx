import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { Ship, Plane, FileCheck, Warehouse, Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Sea, Air, Customs & Warehousing | NDL Cargo" },
      { name: "description", content: "NDL Cargo services: Sea FCL & LCL, Air cargo, in-house customs clearing and warehousing plus Ghana-wide delivery." },
      { property: "og:title", content: "NDL Cargo Services" },
      { property: "og:description", content: "Sea FCL/LCL, Air cargo, customs clearing, warehousing and last-mile delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://ndlgh.susuboxgh.com/services" }],
  }),
  component: ServicesPage,
});

const SERVICES = [
  {
    icon: Ship,
    name: "Sea Freight — FCL & LCL",
    tagline: "Cost-efficient ocean shipping for volume cargo.",
    features: [
      "LCL groupage: pay only for the space you use",
      "FCL 20ft / 40ft dedicated containers",
      "Weekly sailings from China, Dubai, US",
      "Full documentation & port handling included",
    ],
  },
  {
    icon: Plane,
    name: "Air Cargo",
    tagline: "Fast track your urgent shipments.",
    features: [
      "3–7 day transit from Asia and the Middle East",
      "Express and general cargo options",
      "Direct arrivals at Kotoka International",
      "Temperature-controlled options available",
    ],
  },
  {
    icon: FileCheck,
    name: "Customs Clearing",
    tagline: "In-house licensed brokerage.",
    features: [
      "Ghana Revenue Authority (GRA) filings",
      "Duty optimisation & HS code advisory",
      "No third-party handoffs = no leakage",
      "Same-day release for pre-cleared cargo",
    ],
  },
  {
    icon: Warehouse,
    name: "Warehousing & Delivery",
    tagline: "From port to doorstep, Ghana-wide.",
    features: [
      "Bonded storage at Tema & Accra",
      "Order consolidation and repackaging",
      "Nationwide last-mile delivery",
      "Proof of delivery with photo + signature",
    ],
  },
];

function ServicesPage() {
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Services</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Everything you need to import into Ghana.</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Sea, air, customs, warehousing and last-mile — one team, one accountable partner.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((s, i) => <ServiceCard key={s.name} s={s} delay={i * 60} />)}
        </div>

        <div className="mt-12 rounded-2xl border bg-card p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-brand-navy">Get a shipping plan tailored to you</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Tell us what you're shipping and where from — we'll recommend the right mode and consolidation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/quote"><Button className="bg-brand-orange hover:bg-brand-orange/90">Get instant quote <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/contact"><Button variant="outline">Talk to us</Button></Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function ServiceCard({ s, delay }: { s: (typeof SERVICES)[number]; delay: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      <Card className="h-full p-7">
        <div className="rounded-lg bg-brand-orange/10 p-3 w-fit text-brand-orange">
          <s.icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold text-brand-navy">{s.name}</h3>
        <p className="mt-1 text-sm text-brand-sky">{s.tagline}</p>
        <ul className="mt-5 space-y-2 text-sm">
          {s.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
