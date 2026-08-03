import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { QuoteEngine } from "@/components/marketing/QuoteEngine";
import { Card } from "@/components/ui/card";
import { Calculator, Zap, ShieldCheck, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Instant Freight Quote — NDL Cargo Ghana" },
      { name: "description", content: "Calculate your shipping cost from China, Dubai, Thailand, Canada or the US to Ghana in seconds. Live tariffs, volumetric weight, chargeable rates." },
      { property: "og:title", content: "Get an instant freight quote — NDL Cargo" },
      { property: "og:description", content: "Live tariff calculator with volumetric weight & CBM auto-calc." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://ndlgh.susuboxgh.com/quote" }],
  }),
  component: QuotePage,
});

function QuotePage() {
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Quote engine</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Know your freight cost in seconds</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            We use live tariffs from our carrier contracts. Enter weight and dimensions — the engine chooses whichever is more costly, chargeable weight or volume.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[2fr_1fr]">
        <QuoteEngine />
        <div className="space-y-4">
          <InfoCard icon={Zap} title="Live tariffs" desc="Rates come straight from our carrier contracts and warehouse deals — no cached spreadsheets." />
          <InfoCard icon={Calculator} title="Volumetric weight" desc="For air cargo we chargeable-weight at 167 kg/CBM. The engine handles it automatically." />
          <InfoCard icon={ShieldCheck} title="Transparent" desc="Indicative pricing only — final quote confirms once we inspect the cargo. No hidden surcharges." />
          <InfoCard icon={MessageCircle} title="One-tap confirm" desc="Prefer WhatsApp? Confirm the quote directly with our team in one click." />
        </div>
      </section>
    </MarketingLayout>
  );
}

function InfoCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Card className="p-5">
      <div className="rounded-lg bg-brand-orange/10 p-2 w-fit text-brand-orange"><Icon className="h-4 w-4" /></div>
      <div className="mt-3 font-display text-base font-bold text-brand-navy">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}
