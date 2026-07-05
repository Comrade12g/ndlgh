import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LogoLockup } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { LogOut, Package, PackageSearch, MapPin, Copy, Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
    return { user: data.user };
  },
  component: PortalPage,
});

function PortalPage() {
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["portal-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, shipping_mark")
        .eq("id", u.user.id)
        .maybeSingle();
      return { email: u.user.email ?? "", ...data };
    },
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("warehouses")
        .select("code, name, country, address")
        .order("code");
      return data ?? [];
    },
  });

  // Explicit customer_id filters below are intentional, not redundant with
  // RLS: an account that also holds a staff role (e.g. an employee who
  // still has a leftover 'customer' role, or simply navigates here out of
  // curiosity) would otherwise see EVERY customer's data, because the
  // separate "Staff manage X" RLS policies grant staff broad access and
  // Postgres RLS policies are OR'd together. Filtering here guarantees
  // this page only ever shows the signed-in user's own records,
  // regardless of what other roles their account might also hold.
  const { data: myPackages } = useQuery({
    queryKey: ["portal-packages"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("packages")
        .select("id, tracking_code, description, status, pieces, weight_kg, received_at")
        .eq("customer_id", u.user.id)
        .order("received_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const { data: myShipments } = useQuery({
    queryKey: ["portal-shipments"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data: myPkgs } = await supabase
        .from("packages")
        .select("id")
        .eq("customer_id", u.user.id);
      const pkgIds = (myPkgs ?? []).map((p) => p.id);
      if (!pkgIds.length) return [];
      const { data: links } = await supabase
        .from("shipment_packages")
        .select("shipment_id")
        .in("package_id", pkgIds);
      const shipmentIds = Array.from(new Set((links ?? []).map((l) => l.shipment_id)));
      if (!shipmentIds.length) return [];
      const { data } = await supabase
        .from("shipments")
        .select("id, code, mode, status, eta, origin_warehouse")
        .in("id", shipmentIds)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const { data: myDeliveries } = useQuery({
    queryKey: ["portal-deliveries"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("deliveries")
        .select("id, code, city, status, scheduled_for, delivered_at")
        .eq("customer_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const { data: myInvoices } = useQuery({
    queryKey: ["portal-invoices"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("invoices")
        .select("id, number, currency, total, amount_paid, status, due_date")
        .eq("customer_id", u.user.id)
        .order("issue_date", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/">
            <LogoLockup compact />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-brand-navy">
                {profile?.full_name ?? profile?.email}
              </div>
              {profile?.shipping_mark && (
                <div className="font-mono text-xs text-brand-orange">{profile.shipping_mark}</div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Shipping mark banner */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-navy to-brand-sky p-6 text-white md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/70">
                Your NDL Shipping Mark
              </div>
              <div className="mt-2 font-mono text-3xl font-extrabold md:text-4xl">
                {profile?.shipping_mark ?? "…"}
              </div>
              <p className="mt-3 max-w-md text-sm text-white/85">
                Write this mark on every package sent to our warehouses so we can identify it as
                yours.
              </p>
            </div>
            {profile?.shipping_mark && (
              <Button
                onClick={() => copy(profile.shipping_mark!)}
                className="bg-brand-orange hover:bg-brand-orange/90"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy mark
              </Button>
            )}
          </div>
        </Card>

        {/* Warehouses */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-orange" />
            <h2 className="font-display text-xl font-bold text-brand-navy">
              Ship your goods to our warehouses
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {warehouses
              ?.filter((w) => w.code !== "GH")
              .map((w) => (
                <Card key={w.code} className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-display text-lg font-bold text-brand-navy">{w.name}</div>
                    <span className="rounded-md bg-brand-orange/10 px-2 py-0.5 text-xs font-semibold uppercase text-brand-orange">
                      {w.country}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Recipient:{" "}
                      <span className="font-semibold text-foreground">
                        NDL {w.code} — {profile?.shipping_mark ?? ""}
                      </span>
                    </div>
                    {w.address && <div className="whitespace-pre-line">{w.address}</div>}
                  </div>
                </Card>
              ))}
          </div>
        </section>

        {/* My packages / shipments / deliveries / invoices */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-navy" />
              <h2 className="font-display text-lg font-bold text-brand-navy">My packages</h2>
            </div>
            {!myPackages?.length ? (
              <p className="text-sm text-muted-foreground">
                No packages received yet. Ship to one of our warehouses using your mark above.
              </p>
            ) : (
              <div className="grid gap-2">
                {myPackages.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-brand-navy">
                        {p.tracking_code}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.description ?? `${p.pieces} pcs, ${Number(p.weight_kg).toFixed(1)}kg`}
                      </div>
                    </div>
                    <StatusBadge tone={statusTone(p.status)}>
                      {p.status.replace("_", " ")}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <PackageSearch className="h-5 w-5 text-brand-navy" />
              <h2 className="font-display text-lg font-bold text-brand-navy">My shipments</h2>
            </div>
            {!myShipments?.length ? (
              <p className="text-sm text-muted-foreground">
                Shipments appear here once your packages are consolidated and loaded.
              </p>
            ) : (
              <div className="grid gap-2">
                {myShipments.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-brand-navy">
                        {s.code}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.mode.replace("_", " ")} {s.eta ? `· ETA ${s.eta}` : ""}
                      </div>
                    </div>
                    <StatusBadge tone={statusTone(s.status)}>{s.status}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-navy" />
              <h2 className="font-display text-lg font-bold text-brand-navy">My deliveries</h2>
            </div>
            {!myDeliveries?.length ? (
              <p className="text-sm text-muted-foreground">
                Book last-mile delivery once your goods arrive in Ghana — talk to our team on
                WhatsApp.
              </p>
            ) : (
              <div className="grid gap-2">
                {myDeliveries.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-brand-navy">
                        {d.code}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {d.city} {d.scheduled_for ? `· ${d.scheduled_for}` : ""}
                      </div>
                    </div>
                    <StatusBadge tone={statusTone(d.status)}>
                      {d.status.replace("_", " ")}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-brand-navy" />
              <h2 className="font-display text-lg font-bold text-brand-navy">My invoices</h2>
            </div>
            {!myInvoices?.length ? (
              <p className="text-sm text-muted-foreground">
                Invoices will show here once billed by our team.
              </p>
            ) : (
              <div className="grid gap-2">
                {myInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-brand-navy">
                        {inv.number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inv.currency} {Number(inv.total).toFixed(2)}{" "}
                        {inv.due_date ? `· due ${inv.due_date}` : ""}
                      </div>
                    </div>
                    <StatusBadge tone={statusTone(inv.status)}>{inv.status}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
