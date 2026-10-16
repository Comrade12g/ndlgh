import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteEngine } from "@/components/marketing/QuoteEngine";
import { useReveal } from "@/hooks/use-reveal";
import { ArrowLeft, MapPin, Clock, Package, ArrowRight, MessageCircle } from "lucide-react";
import { BUSINESS, WHATSAPP_URL } from "@/config/business";
import { LANE_SEO, LANE_FAQ, ChinaLaneContent } from "@/components/marketing/LaneSeoContent";

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
      { mode: "Sea LCL (groupage)", time: `${BUSINESS.seaLclDays} days` },
      { mode: "Air cargo", time: `${BUSINESS.airDays} days` },
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
    if (!loaderData) {
      return {
        meta: [
          { title: "Lane not found — NDL Cargo Ghana" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const seo = LANE_SEO[params.origin];
    const url = `${BUSINESS.domain}/lanes/${params.origin}`;
    const faq = LANE_FAQ[params.origin] ?? [];
    const scripts: any[] = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${BUSINESS.domain}/` },
            { "@type": "ListItem", position: 2, name: "Lanes", item: `${BUSINESS.domain}/lanes` },
            { "@type": "ListItem", position: 3, name, item: url },
          ],
        }),
      },
    ];
    if (faq.length) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }),
      });
    }
    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.description },
        { property: "og:title", content: seo.ogTitle },
        { property: "og:description", content: seo.ogDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: seo.image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seo.ogTitle },
        { name: "twitter:description", content: seo.ogDescription },
        { name: "twitter:image", content: seo.image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
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
  const { origin } = Route.useParams();
  const seo = LANE_SEO[origin];
  const faq = LANE_FAQ[origin] ?? [];

  const ref = useReveal<HTMLDivElement>();
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-14 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-white/70">
            <Link to="/" className="hover:text-white">Home</Link><span>›</span>
            <Link to="/lanes" className="inline-flex items-center gap-1 hover:text-white"><ArrowLeft className="h-4 w-4" /> Lanes</Link><span>›</span>
            <span className="text-white">{d.name}</span>
          </nav>
          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-orange">{d.region}</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">{seo.h1}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{origin === "china" ? `NDL Cargo ships goods from China to Ghana by sea and air every week. We have teams and warehouses in Yiwu, Guangzhou and Taizhou, so your cargo is received, consolidated and loaded by our own people. Our licensed brokers clear it at Tema, and we deliver to your door anywhere in Ghana.` : d.intro}</p>
          {origin === "china" && (
            <>
              <p className="mt-4 font-semibold text-brand-orange">Sea freight from ${BUSINESS.seaLclFromUsdPerCbm} per CBM. Customs clearing included for LCL shipments.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/quote"><Button className="bg-brand-orange hover:bg-brand-orange/90">Get an instant quote <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10"><MessageCircle className="mr-2 h-4 w-4" />Chat on WhatsApp</Button></a>
              </div>
            </>
          )}
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

        {origin === "china" && <ChinaLaneContent />}

        {faq.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-black text-brand-navy md:text-3xl">Frequently asked questions</h2>
            <div className="mt-6 space-y-5">
              {faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-brand-navy">{f.q}</h3>
                  <p className="mt-1 text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {origin !== "china" && (
          <p className="mt-10 text-sm text-muted-foreground">
            Useful links: <Link to="/buy-from-china" className="text-brand-sky underline">buy from China</Link> ·{" "}
            <Link to="/lanes/$origin" params={{ origin: "china" }} className="text-brand-sky underline">China to Ghana shipping</Link> ·{" "}
            <Link to="/guides/$slug" params={{ slug: "clearing-goods-at-tema-port" }} className="text-brand-sky underline">clearing goods at Tema Port</Link> ·{" "}
            <Link to="/guides/$slug" params={{ slug: "lcl-vs-fcl-shipping-to-ghana" }} className="text-brand-sky underline">LCL vs FCL shipping</Link>
          </p>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl bg-brand-navy p-8 text-white">
            <h2 className="font-display text-2xl font-black">Ready to ship from {d.name}?</h2>
            <p className="mt-2 text-white/75">Get your rate in seconds or talk to our team.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/quote"><Button className="bg-brand-orange hover:bg-brand-orange/90">Instant quote <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">Chat on WhatsApp</Button></a>
            </div>
          </div>
          <QuoteEngine compact />
        </div>
      </section>
    </MarketingLayout>
  );
}
