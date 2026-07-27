import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteEngine } from "@/components/marketing/QuoteEngine";
import { useReveal } from "@/hooks/use-reveal";
import { ArrowLeft, MapPin, Clock, Package, ArrowRight } from "lucide-react";

type LaneDetail = {
  name: string;
  region: string;
  intro: string;
  hubs: { city: string; specialty: string }[];
  transit: { mode: string; time: string }[];
  cargo: string[];
};

const DETAILS: Record<string, LaneDetail> = {
  china: {
    name: "China", region: "East Asia",
    intro: "China is NDL's largest origin. Our teams operate directly out of Yiwu, Guangzhou and Taizhou, giving customers first-hand supplier coordination, warehouse consolidation and container loading — no middlemen.",
    hubs: [
      { city: "Yiwu", specialty: "Small commodities, gifts, accessories, textiles" },
      { city: "Guangzhou", specialty: "Electronics, cosmetics, fashion" },
      { city: "Taizhou", specialty: "Hardware, plumbing, machinery, tools" },
    ],
    transit: [
      { mode: "Sea LCL (groupage)", time: "25–35 days" },
      { mode: "Sea FCL (20ft / 40ft)", time: "22–30 days" },
      { mode: "Air cargo", time: "5–7 days" },
      { mode: "Express air", time: "3–5 days" },
    ],
    cargo: ["Small commodities & gifts", "Electronics & phones", "Cosmetics & beauty", "Fashion & textiles", "Hardware & industrial", "Machinery & spare parts"],
  },
  dubai: {
    name: "Dubai", region: "United Arab Emirates",
    intro: "Dubai is a fast, high-value lane. Air-first with fortnightly sea consolidation, especially strong for cosmetics, gold, perfumes and machinery.",
    hubs: [{ city: "Dubai (DXB)", specialty: "Cosmetics, gold, perfumes, machinery" }],
    transit: [{ mode: "Air cargo", time: "3–5 days" }, { mode: "Sea LCL", time: "18–24 days" }],
    cargo: ["Cosmetics & perfumes", "Gold & jewellery (compliant)", "Machinery", "Auto spares", "Textiles"],
  },
  thailand: {
    name: "Thailand", region: "Southeast Asia",
    intro: "Regular consolidation lane out of Bangkok, popular for auto parts, wellness products and specialty foods.",
    hubs: [{ city: "Bangkok", specialty: "Auto parts, wellness, food, textiles" }],
    transit: [{ mode: "Sea LCL", time: "28–35 days" }, { mode: "Air cargo", time: "5–7 days" }],
    cargo: ["Auto parts", "Wellness & supplements", "Food products", "Textiles"],
  },
  canada: {
    name: "Canada", region: "North America",
    intro: "Bi-weekly groupage out of Toronto — personal effects, e-commerce returns and retail overstock.",
    hubs: [{ city: "Toronto", specialty: "Personal effects, retail, e-commerce" }],
    transit: [{ mode: "Sea LCL", time: "35–45 days" }, { mode: "Air cargo", time: "6–8 days" }],
    cargo: ["Personal effects", "Retail returns", "E-commerce parcels", "Household goods"],
  },
  us: {
    name: "United States", region: "North America",
    intro: "Weekly groupage from New York and Los Angeles. Strong on e-commerce parcels, machinery, and vehicles.",
    hubs: [
      { city: "New York", specialty: "E-commerce, retail, machinery" },
      { city: "Los Angeles", specialty: "Vehicles, machinery, apparel" },
    ],
    transit: [{ mode: "Sea LCL", time: "30–40 days" }, { mode: "Sea FCL", time: "28–35 days" }, { mode: "Air cargo", time: "5–8 days" }],
    cargo: ["E-commerce parcels", "Vehicles & auto parts", "Machinery", "Apparel", "Electronics"],
  },
};

export const Route = createFileRoute("/lanes/$origin")({
  loader: ({ params }) => {
    const d = DETAILS[params.origin];
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? params.origin;
    return {
      meta: [
        { title: `${name} to Ghana — Shipping lane | NDL Cargo` },
        { name: "description", content: `Ship from ${name} to Ghana with NDL Cargo. Sea LCL, FCL and air freight with in-house customs clearing.` },
        { property: "og:title", content: `${name} → Ghana with NDL Cargo` },
        { property: "og:description", content: `Weekly consolidation from ${name} into Tema Port and Kotoka International.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: LaneDetailPage,
  notFoundComponent: () => (
    <MarketingLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-brand-navy">Lane not found</h1>
        <p className="mt-2 text-muted-foreground">We don't have that origin listed. Explore all lanes below.</p>
        <div className="mt-6"><Link to="/lanes"><Button>All lanes</Button></Link></div>
      </div>
    </MarketingLayout>
  ),
});

function LaneDetailPage() {
  const d: LaneDetail = Route.useLoaderData();

  const d = Route.useLoaderData();
  const ref = useReveal<HTMLDivElement>();
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-14 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <Link to="/lanes" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All lanes
          </Link>
          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-orange">{d.region}</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">{d.name} → Ghana</h1>
          <p className="mt-4 max-w-2xl text-white/80">{d.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div ref={ref} className="reveal grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-brand-orange"><MapPin className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">Origin hubs</span></div>
            <ul className="mt-4 space-y-4">
              {d.hubs.map((h) => (
                <li key={h.city} className="border-l-2 border-brand-orange pl-4">
                  <div className="font-display text-lg font-bold text-brand-navy">{h.city}</div>
                  <div className="text-sm text-muted-foreground">{h.specialty}</div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-brand-orange"><Clock className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">Transit times</span></div>
            <ul className="mt-4 divide-y">
              {d.transit.map((t) => (
                <li key={t.mode} className="flex items-center justify-between py-2">
                  <span className="text-sm">{t.mode}</span>
                  <span className="font-mono text-sm font-bold tabular-nums text-brand-navy">{t.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2 text-brand-orange"><Package className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">Common cargo</span></div>
          <div className="mt-4 flex flex-wrap gap-2">
            {d.cargo.map((c) => (
              <span key={c} className="rounded-full border bg-secondary/50 px-3 py-1 text-sm">{c}</span>
            ))}
          </div>
        </Card>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl bg-brand-navy p-8 text-white">
            <h2 className="font-display text-2xl font-black">Ready to ship from {d.name}?</h2>
            <p className="mt-2 text-white/75">Get an indicative rate right now or reach us on WhatsApp.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/quote"><Button className="bg-brand-orange hover:bg-brand-orange/90">Instant quote <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/contact"><Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">Contact team</Button></Link>
            </div>
          </div>
          <QuoteEngine compact />
        </div>
      </section>
    </MarketingLayout>
  );
}
