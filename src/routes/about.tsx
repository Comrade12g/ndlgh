import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/hooks/use-reveal";
import { Users, FileCheck, Warehouse, ShieldCheck, Globe2, Handshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NDL Cargo — Ghana's trusted freight partner" },
      { name: "description", content: "NDL Cargo is a Ghanaian-owned freight and customs company operating from China, Dubai and North America into Tema Port." },
      { property: "og:title", content: "About NDL Cargo" },
      { property: "og:description", content: "Ghanaian-owned, globally connected freight and customs specialists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

const TEAMS = [
  { icon: Users, name: "Operations", desc: "Warehouse intake, consolidation, and shipment planning across all origin hubs." },
  { icon: FileCheck, name: "Customs", desc: "Licensed in-house brokerage handling every GRA filing — no third-party leakage." },
  { icon: Warehouse, name: "Warehousing", desc: "Bonded storage at Tema and Accra, order consolidation, and Ghana-wide dispatch." },
];

const VALUES = [
  { icon: ShieldCheck, k: "Accountable", v: "One team, one point of contact from booking to doorstep." },
  { icon: Globe2, k: "Globally connected", v: "Our own teams in Yiwu, Guangzhou, Taizhou and Dubai." },
  { icon: Handshake, k: "Fair pricing", v: "Live tariffs, no cached spreadsheets, no surprise surcharges." },
];

function AboutPage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">About</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Ghanaian-owned. Globally connected.</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            NDL Cargo moves goods from China, Dubai, Thailand, Canada and the US into Ghana. We own the pipeline end-to-end: warehousing at origin, sea and air consolidation, customs clearing and Ghana-wide last-mile delivery.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div ref={ref} className="reveal">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Teams</div>
          <h2 className="mt-2 font-display text-3xl font-black text-brand-navy">How we're organised</h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TEAMS.map((t, i) => <TeamCard key={t.name} team={t} delay={i * 80} />)}
        </div>

        <div className="mt-16">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">What we stand for</div>
          <h2 className="mt-2 font-display text-3xl font-black text-brand-navy">Our values</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.k} className="rounded-xl border bg-card p-6">
                <div className="rounded-lg bg-brand-orange/10 p-2 w-fit text-brand-orange"><v.icon className="h-5 w-5" /></div>
                <div className="mt-4 font-display text-lg font-bold text-brand-navy">{v.k}</div>
                <p className="mt-1 text-sm text-muted-foreground">{v.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-brand-navy p-10 text-white">
          <h2 className="font-display text-2xl font-black">Work with us</h2>
          <p className="mt-2 max-w-xl text-white/80">
            Whether you're a small importer or a full container customer, our team is ready to plan your next shipment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact"><Button className="bg-brand-orange hover:bg-brand-orange/90">Contact us</Button></Link>
            <Link to="/quote"><Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">Get a quote</Button></Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function TeamCard({ team, delay }: { team: (typeof TEAMS)[number]; delay: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      <Card className="h-full p-6">
        <div className="rounded-lg bg-brand-sky/10 p-2.5 w-fit text-brand-sky"><team.icon className="h-5 w-5" /></div>
        <h3 className="mt-4 font-display text-xl font-bold text-brand-navy">{team.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{team.desc}</p>
      </Card>
    </div>
  );
}
