import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Leaf, Users, Cpu, ShieldCheck, Recycle, GraduationCap, HeartHandshake } from "lucide-react";

const TITLE = "Our Impact & UN SDGs | NDL Cargo Ghana";
const DESC = "How NDL Cargo Ghana gives back: fair shipping for small traders, import education, greener consolidated freight and support for the UN Sustainable Development Goals.";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.ndlgh.com/impact" }],
  }),
  component: ImpactPage,
});

const SDGS = [
  { n: 8, title: "Decent Work & Economic Growth", icon: Briefcase,
    text: "Small traders get the same clear sea rate as big importers — $230 per CBM with clearing included — so more Ghanaians can start and grow import businesses." },
  { n: 5, title: "Gender Equality", icon: Users,
    text: "Women run much of Ghana's market trade. We support women-led businesses with plain-language import guidance and safe supplier payment help." },
  { n: 12, title: "Responsible Consumption & Production", icon: Leaf,
    text: "Consolidating many customers' goods into shared containers means fewer half-empty shipments and less waste per item moved." },
  { n: 9, title: "Industry, Innovation & Infrastructure", icon: Cpu,
    text: "Online tracking, shipping marks and digital invoices bring transparency to the China–Ghana trade route." },
];

const COMMITMENTS = [
  { icon: ShieldCheck, t: "No hidden fees", d: "Clear prices published on our website before you ship." },
  { icon: GraduationCap, t: "Free import education", d: "Free guides on safe buying, customs and avoiding supplier scams." },
  { icon: Recycle, t: "Less waste", d: "Shared containers and reuse of packaging where possible." },
  { icon: HeartHandshake, t: "Community first", d: "Supporting local traders, families and young entrepreneurs across Ghana." },
];

function ImpactPage() {
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Giving back</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Shipping that lifts communities.</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            NDL Cargo Ghana is more than a freight forwarder. We see trade as a way to create jobs, support families and
            open opportunity — and we align our work with the United Nations Sustainable Development Goals.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-brand-navy">The UN goals we support</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {SDGS.map((g) => (
            <Card key={g.n} className="flex gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-orange text-white">
                <span className="text-[10px] font-semibold uppercase">SDG</span>
                <span className="font-display text-xl font-black leading-none">{g.n}</span>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-brand-navy"><g.icon className="h-4 w-4 text-brand-sky" /> {g.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-3xl font-bold text-brand-navy">Our commitments</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMMITMENTS.map((c) => (
              <li key={c.t}>
                <Card className="h-full p-6">
                  <c.icon className="h-7 w-7 text-brand-orange" />
                  <h3 className="mt-3 font-semibold text-brand-navy">{c.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-brand-navy">Grow your business with us</h2>
        <p className="mt-3 text-muted-foreground">Start importing safely from China with clear prices and free guidance.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-brand-orange hover:bg-brand-orange/90"><Link to="/quote">Get a quote</Link></Button>
          <Button asChild variant="outline"><Link to="/guides">Read free guides</Link></Button>
        </div>
      </section>
    </MarketingLayout>
  );
}
