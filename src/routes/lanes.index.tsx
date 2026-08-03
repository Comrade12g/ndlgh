import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/lanes/")({
  head: () => ({
    meta: [
      { title: "Shipping Lanes — China, Dubai, Thailand, Canada, US to Ghana" },
      { name: "description", content: "Weekly consolidation from Yiwu, Guangzhou, Taizhou, Dubai, Bangkok, Toronto and New York into Tema, Ghana." },
      { property: "og:title", content: "NDL Cargo Shipping Lanes" },
      { property: "og:description", content: "Weekly consolidation lanes from China, Dubai, Thailand, Canada and the US into Ghana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LanesPage,
});

const LANES = [
  {
    code: "china", name: "China", hubs: "Yiwu · Guangzhou · Taizhou",
    blurb: "Our largest origin — small commodities, electronics, textiles, hardware and machinery. Weekly sea groupage plus dedicated FCL for larger orders.",
    metrics: [
      { k: "Sea LCL", v: "25–35 days" },
      { k: "Air cargo", v: "5–7 days" },
      { k: "Cutoff", v: "Every Friday" },
    ],
  },
  {
    code: "dubai", name: "Dubai (UAE)", hubs: "DXB",
    blurb: "Cosmetics, perfumes, gold, machinery and re-exports. Air-first lane with fortnightly sea consolidation.",
    metrics: [{ k: "Air cargo", v: "3–5 days" }, { k: "Sea LCL", v: "18–24 days" }, { k: "Cutoff", v: "Wednesdays" }],
  },
  {
    code: "thailand", name: "Thailand", hubs: "Bangkok",
    blurb: "Auto parts, wellness and food products. Regular monthly consolidation.",
    metrics: [{ k: "Sea LCL", v: "28–35 days" }, { k: "Air cargo", v: "5–7 days" }, { k: "Cutoff", v: "Monthly" }],
  },
  {
    code: "canada", name: "Canada", hubs: "Toronto",
    blurb: "Personal effects, e-commerce returns and retail. Sea groupage every 2 weeks.",
    metrics: [{ k: "Sea LCL", v: "35–45 days" }, { k: "Cutoff", v: "Bi-weekly" }],
  },
  {
    code: "us", name: "United States", hubs: "New York · Los Angeles",
    blurb: "E-commerce parcels, machinery, vehicles and personal effects. Weekly groupage and dedicated container.",
    metrics: [{ k: "Sea LCL", v: "30–40 days" }, { k: "Air cargo", v: "5–8 days" }, { k: "Cutoff", v: "Weekly" }],
  },
];

function LanesPage() {
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Lanes</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Our shipping lanes</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Weekly consolidation from five origin regions into Tema Port and Kotoka International — with full customs clearing on arrival.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LANES.map((l, i) => <LaneCard key={l.code} lane={l} delay={i * 70} />)}
        </div>
      </section>
    </MarketingLayout>
  );
}

function LaneCard({ lane, delay }: { lane: (typeof LANES)[number]; delay: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Link to="/lanes/$origin" params={{ origin: lane.code }} className="group block">
      <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
        <Card className="h-full p-6 transition-all group-hover:-translate-y-1 group-hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-brand-navy">{lane.name}</h3>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-brand-sky">{lane.hubs}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-brand-orange transition-transform group-hover:translate-x-1" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{lane.blurb}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4">
            {lane.metrics.map((m) => (
              <div key={m.k}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</div>
                <div className="font-mono text-sm font-bold tabular-nums text-brand-navy">{m.v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Link>
  );
}
