import { createFileRoute } from "@tanstack/react-router";
import { AnimatedBackdrop } from "@/components/marketing/AnimatedBackdrop";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { TrackingLookup } from "@/components/marketing/TrackingLookup";
import { MilestoneTimeline } from "@/components/tracking/MilestoneTimeline";
import { Card } from "@/components/ui/card";
import { PackageSearch, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [
      { title: "Track your shipment — NDL Cargo Ghana" },
      { name: "description", content: "Track your NDL Cargo shipment with your NDL-CN-##### or NDL-GH-##### reference number." },
      { property: "og:title", content: "Track your shipment — NDL Cargo" },
      { property: "og:description", content: "Live milestone tracking for every NDL Cargo shipment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-14 text-white">
        <AnimatedBackdrop />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange">
            <PackageSearch className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-4xl font-black md:text-5xl">Track your shipment</h1>
          <p className="mt-3 text-white/75">Enter your NDL reference to see every milestone from origin to delivery.</p>
          <div className="mt-8">
            <TrackingLookup variant="page" />
          </div>
          <p className="mt-3 text-xs text-white/50">Example: NDL-CN-00042 or NDL-GH-00108</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <Card className="p-6">
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Lifecycle preview</div>
          <MilestoneTimeline current="customs_clearance" />
        </Card>
        <div className="mt-6 flex items-start gap-3 rounded-xl border bg-secondary/40 p-4 text-sm">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-orange" />
          <p className="text-muted-foreground">
            Public tracking shows shipment status only — never customer names, invoices or private data. Sign in to your portal for full order details.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}
