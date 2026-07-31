import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatedBackdrop } from "@/components/marketing/AnimatedBackdrop";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomerTrackingCard } from "@/components/tracking/CustomerTrackingCard";
import type { MilestoneKey } from "@/components/tracking/MilestoneTimeline";
import { getPublicShipmentStatus } from "@/lib/public-api.functions";
import { PackageSearch, Clock, ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/track/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Tracking ${params.code} — NDL Cargo Ghana` },
      { name: "description", content: `Live milestone tracking for NDL Cargo shipment ${params.code}.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { code } = Route.useParams();
  const fetchStatus = useServerFn(getPublicShipmentStatus);
  const q = useQuery({
    queryKey: ["public-shipment-status", code],
    queryFn: () => fetchStatus({ data: { ref: code } }),
    staleTime: 30_000,
  });

  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-10 text-white">
        <AnimatedBackdrop />
        <div className="relative mx-auto max-w-4xl px-4">
          <Link to="/tracking" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> New search
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-lg bg-brand-orange/20 p-2 text-brand-orange">
              <PackageSearch className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-white/60">Reference</div>
              <div className="font-mono text-2xl font-bold">{code}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        {q.isLoading ? (
          <Card className="p-10 text-center text-muted-foreground">Looking up your shipment…</Card>
        ) : q.data ? (
          <>
            <CustomerTrackingCard
              s={{
                ...(q.data as Record<string, unknown>),
                ndl_reference: q.data.ndl_reference,
                origin_city: q.data.origin_city,
                destination_city: q.data.destination_city,
                current_milestone: q.data.current_milestone as MilestoneKey,
                current_eta: q.data.current_eta,
                eta_last_changed_at: q.data.eta_last_changed_at,
                eta_recently_changed: q.data.eta_recently_changed,
              }}
            />

            <div className="mt-6 flex items-start gap-3 rounded-xl border bg-secondary/40 p-4 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 text-brand-orange" />
              <div>
                <div className="font-semibold text-brand-navy">Need full details?</div>
                <p className="text-muted-foreground">
                  Sign in to your customer portal for invoices, package lists, and delivery contact.
                </p>
                <Link to="/auth" className="mt-2 inline-block">
                  <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90">Sign in to portal</Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <Card className="p-10 text-center">
            <Clock className="mx-auto h-10 w-10 text-brand-sky" />
            <h1 className="mt-4 font-display text-xl font-bold text-brand-navy">Tracking not available yet</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We couldn't find this reference. It may not be in our system yet, or the code could be mistyped. Sign in to the portal to see all your packages.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/auth">
                <Button className="bg-brand-orange hover:bg-brand-orange/90">Sign in to portal</Button>
              </Link>
              <Link to="/tracking">
                <Button variant="outline">Try another code</Button>
              </Link>
            </div>
          </Card>
        )}
      </section>
    </MarketingLayout>
  );
}
