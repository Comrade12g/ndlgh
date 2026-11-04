import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, Container, FileCheck, Truck, Package, MessageCircle } from "lucide-react";
import { BUSINESS, WHATSAPP_URL } from "@/config/business";

const URL = "https://www.ndlgh.com/fcl";
const TITLE = "FCL Container Shipping China to Ghana | 20ft & 40ft | NDL Cargo";
const DESC =
  "Book a full 20ft, 40ft or 40ft High Cube container from China to Tema Port with NDL Cargo Ghana. In-house customs clearing and delivery across Ghana. Request an FCL quote.";

const CONTAINERS = [
  { name: "20ft standard", cbm: "about 25–28 CBM usable", best: "Heavy goods: tiles, hardware, machinery, building materials." },
  { name: "40ft standard", cbm: "about 55–58 CBM usable", best: "General merchandise, furniture, mixed product lines." },
  { name: "40ft High Cube", cbm: "about 65–68 CBM usable", best: "Bulky, lighter goods: clothing, plastics, household items." },
];

const STEPS = [
  { icon: Package, t: "Tell us your cargo", d: "Send your goods list, supplier location and target date. We recommend the right container size." },
  { icon: Container, t: "Container booking & loading in China", d: "We book space and arrange loading of your container in China." },
  { icon: Ship, t: "Ocean freight to Tema", d: "Your container sails to Tema Port. You can follow progress on our tracking page." },
  { icon: FileCheck, t: "Customs clearing at Tema", d: "NDL's in-house agents handle the declaration, duty payment and release." },
  { icon: Truck, t: "Delivery in Ghana", d: "We deliver to your shop or warehouse in Accra, Kumasi or anywhere in Ghana." },
];

const FAQ = [
  { q: "What does FCL mean?", a: "FCL means full container load: you book a whole 20ft or 40ft container and only your goods are inside." },
  { q: "When should I choose FCL instead of LCL?", a: `If your goods are only a few CBM, LCL groupage from $${BUSINESS.seaLclFromUsdPerCbm} per CBM is usually cheaper. When your volume gets close to filling a 20ft container, ask NDL to compare both — FCL often wins on cost per unit and handling.` },
  { q: "How much does a container from China to Ghana cost?", a: "Container prices change with the shipping market and season, so we quote each booking. Send your cargo details on WhatsApp or the quote page for a current price." },
  { q: "Does NDL clear FCL containers at Tema?", a: "Yes. NDL's in-house customs agents handle clearing for full containers at Tema Port. Duty is calculated by customs based on your goods." },
  { q: "Which container size do I need?", a: "Roughly: a 20ft container holds about 25–28 CBM, a 40ft about 55–58 CBM and a 40ft High Cube about 65–68 CBM. Heavy goods may hit the weight limit before the space is full." },
  { q: "Do you deliver the container to my warehouse?", a: "Yes, NDL arranges trucking from Tema to your location in Accra, Kumasi and other regions of Ghana." },
];

export const Route = createFileRoute("/fcl")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "FCL container shipping from China to Ghana",
          serviceType: "Full container load (FCL) sea freight",
          provider: { "@type": "LocalBusiness", name: BUSINESS.name, url: BUSINESS.domain, telephone: BUSINESS.phoneIntl },
          areaServed: { "@type": "Country", name: "Ghana" },
          url: URL,
          description: DESC,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.domain },
            { "@type": "ListItem", position: 2, name: "Services", item: `${BUSINESS.domain}/services` },
            { "@type": "ListItem", position: 3, name: "FCL container shipping", item: URL },
          ],
        }),
      },
    ],
  }),
  component: FclPage,
});

function FclPage() {
  return (
    <MarketingLayout>
      <section className="border-b bg-brand-navy py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="text-xs text-white/70">
            <Link to="/" className="hover:underline">Home</Link> / <Link to="/services" className="hover:underline">Services</Link> / FCL
          </nav>
          <h1 className="mt-3 font-display text-4xl font-black md:text-5xl">FCL container shipping from China to Ghana</h1>
          <p className="mt-4 max-w-2xl text-white/85">
            Book a full 20ft, 40ft or 40ft High Cube container to Tema Port. NDL Cargo Ghana handles booking, ocean freight,
            customs clearing at Tema and delivery to your warehouse — one team from China to your door.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90"><Link to="/quote">Get an FCL quote</Link></Button>
            <Button asChild variant="secondary">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp {BUSINESS.phone}</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-brand-navy">Container sizes</h2>
        <p className="mt-2 text-muted-foreground">Usable volume is approximate and depends on carton sizes and how the container is packed.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {CONTAINERS.map((c) => (
            <Card key={c.name} className="p-6">
              <Container className="h-7 w-7 text-brand-orange" />
              <h3 className="mt-3 text-lg font-semibold text-brand-navy">{c.name}</h3>
              <p className="text-sm font-medium text-brand-sky">{c.cbm}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.best}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-3xl font-bold text-brand-navy">How FCL shipping with NDL works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.t}>
                <Card className="h-full p-5">
                  <div className="text-xs font-bold text-brand-orange">Step {i + 1}</div>
                  <s.icon className="mt-2 h-6 w-6 text-brand-navy" />
                  <h3 className="mt-2 font-semibold text-brand-navy">{s.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-brand-navy">FCL or LCL?</h2>
        <p className="mt-3 text-muted-foreground">
          Small orders share a container through our groupage (LCL) service from ${BUSINESS.seaLclFromUsdPerCbm} per CBM with
          clearing included, arriving in about {BUSINESS.seaLclDays} days. Once your order nears a full container, FCL usually
          gives a lower cost per unit and less handling. Read our{" "}
          <Link to="/guides/$slug" params={{ slug: "lcl-vs-fcl-shipping-to-ghana" }} className="font-semibold text-brand-sky underline">LCL vs FCL guide</Link>
          , see <Link to="/lanes/$origin" params={{ origin: "china" }} className="font-semibold text-brand-sky underline">China to Ghana shipping</Link>, or let us{" "}
          <Link to="/buy-from-china" className="font-semibold text-brand-sky underline">source and buy from China</Link> for you.
        </p>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-3xl font-bold text-brand-navy">FCL questions</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-lg border bg-background p-4">
                <summary className="cursor-pointer font-semibold text-brand-navy">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-brand-navy">Ready to book a container?</h2>
        <p className="mt-3 text-muted-foreground">Send your goods list and we'll reply with a current container price.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-brand-orange hover:bg-brand-orange/90"><Link to="/quote">Get an FCL quote</Link></Button>
          <Button asChild variant="outline"><Link to="/contact">Contact us</Link></Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
