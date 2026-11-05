import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LogoLockup } from "@/components/brand/Logo";
import { ArrowLeft, CheckCircle2, Circle, Container } from "lucide-react";
import { BOOKING_STATUS, SIZE_LABEL } from "@/components/portal/ContainerBookings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal_/containers/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Container ${params.code} — NDL Cargo Ghana` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
  },
  component: ContainerTrackingPage,
});

function fmt(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function ContainerTrackingPage() {
  const { code } = Route.useParams();
  const q = useQuery({
    queryKey: ["container-booking", code],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_container_booking", { _code: code });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
  const b = q.data;
  const idx = b ? BOOKING_STATUS.findIndex((s) => s.key === b.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/"><LogoLockup compact /></Link>
          <Link to="/portal" className="inline-flex items-center gap-1 text-sm text-brand-navy hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to portal
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        {q.isLoading ? (
          <Card className="p-10 text-center text-muted-foreground">Loading your container…</Card>
        ) : !b ? (
          <Card className="p-10 text-center text-muted-foreground">We couldn't find container booking {code} on your account.</Card>
        ) : (
          <>
            <Card className="border-0 bg-brand-navy p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <Container className="h-8 w-8 text-brand-orange" />
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-70">Container booking</div>
                  <h1 className="font-mono text-2xl font-bold">{b.code}</h1>
                </div>
              </div>
              <p className="mt-3 text-sm opacity-90">
                {b.quantity} × {SIZE_LABEL[b.container_size] ?? b.container_size} · {b.origin_city} → {b.delivery_city || "Ghana"} · {b.commodity}
              </p>
            </Card>

            <Card className="mt-6 p-6">
              <h2 className="font-display text-lg font-bold text-brand-navy">Progress</h2>
              {b.status === "cancelled" ? (
                <p className="mt-3 text-sm text-destructive">This booking was cancelled. Contact us on WhatsApp if this is a mistake.</p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {BOOKING_STATUS.map((s, i) => (
                    <li key={s.key} className="flex items-center gap-3">
                      {i <= idx ? <CheckCircle2 className="h-5 w-5 text-brand-orange" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                      <span className={cn("text-sm", i === idx ? "font-bold text-brand-navy" : i < idx ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            <Card className="mt-6 grid gap-4 p-6 sm:grid-cols-2">
              {[
                ["Container number", b.container_no || "Assigned at loading"],
                ["Bill of lading", b.bol_no || "—"],
                ["Vessel", b.vessel_or_flight || "—"],
                ["Shipping line", b.carrier || "—"],
                ["Departed", fmt(b.actual_departure || b.etd)],
                ["Expected at Tema", fmt(b.eta)],
                ["Goods ready date", fmt(b.cargo_ready_date)],
                ["Booked on", fmt(b.created_at)],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
                  <div className="font-semibold text-brand-navy">{v}</div>
                </div>
              ))}
            </Card>
            {b.notes && <Card className="mt-6 p-6 text-sm"><span className="font-semibold">Your notes:</span> {b.notes}</Card>}
          </>
        )}
      </main>
    </div>
  );
}
