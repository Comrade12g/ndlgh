import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, Container, FileCheck, Truck, Package, MessageCircle, ShieldCheck, Clock, Scale, Boxes } from "lucide-react";
import { BUSINESS, WHATSAPP_URL } from "@/config/business";
import { IMG, imageSrcSet } from "@/assets/gallery";

const URL = "https://www.ndlgh.com/fcl";
const TITLE = "FCL Container Shipping China to Ghana | 20ft & 40ft | NDL Cargo";
const DESC = `Book a full 20ft, 40ft or 40ft High Cube container from China to Tema Port with NDL Cargo Ghana. ${BUSINESS.seaFclDays} days transit, in-house customs clearing and delivery across Ghana.`;

const CONTAINERS = [
  { name: "20ft standard", cbm: "about 25–28 CBM usable", best: "Heavy goods: tiles, hardware, machinery, building materials, cement products and spare parts. Heavy cargo often reaches the weight limit before the space is full, so a 20ft is usually the right box." },
  { name: "40ft standard", cbm: "about 55–58 CBM usable", best: "General merchandise, furniture, electronics, mixed product lines and shop stock. Twice the space of a 20ft, usually for much less than twice the price." },
  { name: "40ft High Cube", cbm: "about 65–68 CBM usable", best: "Bulky, lighter goods: clothing, bags, shoes, plastics, mattresses and household items. The extra height gives you roughly 10 CBM more than a standard 40ft." },
];

const STEPS = [
  { icon: Package, t: "Tell us your cargo", d: "Send your goods list, supplier location and target date on WhatsApp. We recommend the right container size and give you a current price." },
  { icon: Container, t: "Booking & loading in China", d: "We book space with the shipping line and arrange loading of your container in China, with photos of your goods before the doors are sealed." },
  { icon: Ship, t: "Ocean freight to Tema", d: `Your container sails to Tema Port. Transit is about ${BUSINESS.seaFclDays} days, and you can follow progress on our tracking page.` },
  { icon: FileCheck, t: "Customs clearing at Tema", d: "NDL's in-house agents prepare the declaration, guide you on duty payment and get your container released." },
  { icon: Truck, t: "Delivery in Ghana", d: "We truck the container to your shop or warehouse in Accra, Kumasi or anywhere in Ghana." },
];

const WHY = [
  { icon: ShieldCheck, t: "One team, China to door", d: "Booking, loading, shipping, clearing and delivery handled by NDL — no passing your goods between strangers." },
  { icon: Clock, t: `${BUSINESS.seaFclDays} days transit`, d: "Clear, honest timelines from China to Tema, with updates on WhatsApp along the way." },
  { icon: Scale, t: "Lower cost per item", d: "When your order is big enough, a full container usually costs less per unit than sharing space." },
  { icon: Boxes, t: "Your goods only", d: "Nothing else in the container, less handling and less risk of damage or mix-ups." },
];

const FAQ = [
  { q: "What does FCL mean?", a: "FCL means full container load: you book a whole 20ft or 40ft container and only your goods are inside." },
  { q: "How long does a container take from China to Ghana?", a: `A full container from China to Tema Port takes about ${BUSINESS.seaFclDays} days. Customs clearing and delivery inside Ghana come after arrival.` },
  { q: "When should I choose FCL instead of LCL?", a: `If your goods are only a few CBM, LCL groupage from $${BUSINESS.seaLclFromUsdPerCbm} per CBM is usually cheaper. When your volume gets close to filling a 20ft container, ask NDL to compare both — FCL often wins on cost per unit and handling.` },
  { q: "How much does a container from China to Ghana cost?", a: "Container prices change with the shipping market and season, so we quote each booking. Send your cargo details on WhatsApp or the quote page for a current price." },
  { q: "Does NDL clear FCL containers at Tema?", a: "Yes. NDL's in-house customs agents handle clearing for full containers at Tema Port. Duty is calculated by customs based on your goods." },
  { q: "Which container size do I need?", a: "Roughly: a 20ft container holds about 25–28 CBM, a 40ft about 55–58 CBM and a 40ft High Cube about 65–68 CBM. Heavy goods may hit the weight limit before the space is full." },
  { q: "Can I combine goods from different suppliers in one container?", a: "Yes. Suppliers can deliver to our China warehouse, where we gather your goods and load them into one container for you." },
  { q: "Can NDL buy the goods for me in China?", a: "Yes. Through our Buy from China service we can source products, pay suppliers and then ship everything in your container." },
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

function Photo({ src, alt, eager, className = "" }: { src: string; alt: string; eager?: boolean; className?: string }) {
  return (
    <img
      src={src}
      srcSet={imageSrcSet(src)}
      sizes="(max-width: 768px) 100vw, 50vw"
      alt={alt}
      width={1600}
      height={1067}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

function FclPage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b bg-brand-navy text-white">
        <div className="absolute inset-0 opacity-35">
          <Photo src={IMG.stackedContainers} alt="" eager />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/85 to-brand-navy/40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <nav className="text-xs text-white/70">
            <Link to="/" className="hover:underline">Home</Link> / <Link to="/services" className="hover:underline">Services</Link> / FCL
          </nav>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-black md:text-5xl">FCL container shipping from China to Ghana</h1>
          <p className="mt-4 max-w-2xl text-white/90">
            Book a full 20ft, 40ft or 40ft High Cube container to Tema Port in about {BUSINESS.seaFclDays} days. NDL Cargo Ghana
            handles booking, loading, ocean freight, customs clearing at Tema and delivery to your warehouse — one team from
            China to your door.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-brand-orange hover:bg-brand-orange/90"><Link to="/quote">Get an FCL quote</Link></Button>
            <Button asChild variant="secondary">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp {BUSINESS.phone}</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <div><div className="font-display text-2xl font-black text-brand-orange">{BUSINESS.seaFclDays}</div><div className="text-white/80">days China → Tema</div></div>
            <div><div className="font-display text-2xl font-black text-brand-orange">20ft · 40ft · HQ</div><div className="text-white/80">container sizes</div></div>
            <div><div className="font-display text-2xl font-black text-brand-orange">In-house</div><div className="text-white/80">clearing at Tema</div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold text-brand-navy">A whole container, just for your goods</h2>
          <p className="mt-4 text-muted-foreground">
            Full container load (FCL) shipping means you book an entire container and nothing else goes inside. It is the
            smart choice for importers, wholesalers, contractors and growing shop owners who buy in volume from China —
            whether that's tiles and building materials, furniture, electronics, clothing or machinery.
          </p>
          <p className="mt-3 text-muted-foreground">
            Because your goods are loaded once and opened only at your destination, there is less handling, less risk of
            damage and no waiting for other customers' cargo. And as your order grows, the price per item usually drops
            below what you'd pay to share space.
          </p>
          <p className="mt-3 text-muted-foreground">
            NDL looks after every step: we book the container, coordinate loading in China, track the vessel, clear your
            goods at Tema with our in-house agents and deliver to your door anywhere in Ghana.
          </p>
        </div>
        <figure className="overflow-hidden rounded-xl shadow-lg">
          <div className="aspect-[4/3]"><Photo src={IMG.portCranes} alt="Container cranes loading a cargo ship at port (stock photograph)" /></div>
          <figcaption className="bg-muted px-3 py-2 text-xs text-muted-foreground">Stock photograph · illustrates container shipping</figcaption>
        </figure>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-3xl font-bold text-brand-navy">Container sizes</h2>
          <p className="mt-2 text-muted-foreground">Usable volume is approximate and depends on carton sizes and how the container is packed. Not sure? Send us your packing list and we'll work it out.</p>
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
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
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { src: IMG.freighterNight, alt: "Container ship at sea at night (stock photograph)" },
            { src: IMG.customsClearing, alt: "Customs documents being checked (stock photograph)" },
            { src: IMG.deliveryTruck, alt: "Delivery truck on the road (stock photograph)" },
          ].map((p) => (
            <figure key={p.src} className="overflow-hidden rounded-xl">
              <div className="aspect-[4/3]"><Photo src={p.src} alt={p.alt} /></div>
            </figure>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Stock photographs illustrate shipping services and do not depict NDL's own facilities or team.</p>
      </section>

      <section className="bg-brand-navy py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-3xl font-bold">Why importers ship containers with NDL</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div key={w.t} className="rounded-xl border border-white/15 p-6">
                <w.icon className="h-7 w-7 text-brand-orange" />
                <h3 className="mt-3 font-semibold">{w.t}</h3>
                <p className="mt-1 text-sm text-white/80">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <figure className="overflow-hidden rounded-xl shadow-lg md:order-2">
          <div className="aspect-[4/3]"><Photo src={IMG.warehouseInterior} alt="Goods stored on warehouse racks (stock photograph)" /></div>
          <figcaption className="bg-muted px-3 py-2 text-xs text-muted-foreground">Stock photograph · illustrates warehousing</figcaption>
        </figure>
        <div>
          <h2 className="font-display text-3xl font-bold text-brand-navy">FCL or LCL?</h2>
          <p className="mt-3 text-muted-foreground">
            Small orders share a container through our groupage (LCL) service from ${BUSINESS.seaLclFromUsdPerCbm} per CBM with
            clearing included. Once your order nears a full container — usually around 15 CBM and above — FCL often gives a
            lower cost per unit and less handling. Both take about {BUSINESS.seaLclDays} days from China to Ghana.
          </p>
          <p className="mt-3 text-muted-foreground">
            Read our{" "}
            <Link to="/guides/$slug" params={{ slug: "lcl-vs-fcl-shipping-to-ghana" }} className="font-semibold text-brand-sky underline">LCL vs FCL guide</Link>
            , see <Link to="/lanes/$origin" params={{ origin: "china" }} className="font-semibold text-brand-sky underline">China to Ghana shipping</Link>, or let us{" "}
            <Link to="/buy-from-china" className="font-semibold text-brand-sky underline">source and buy from China</Link> for you.
          </p>
        </div>
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
