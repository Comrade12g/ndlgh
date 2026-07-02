import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LogoLockup } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Package, PackageSearch, MapPin, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
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
        .select("code, name, country, address_line1, address_line2, city, is_active")
        .eq("is_active", true)
        .order("code");
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
          <Link to="/"><LogoLockup compact /></Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-brand-navy">{profile?.full_name ?? profile?.email}</div>
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
              <div className="text-xs uppercase tracking-widest text-white/70">Your NDL Shipping Mark</div>
              <div className="mt-2 font-mono text-3xl font-extrabold md:text-4xl">
                {profile?.shipping_mark ?? "…"}
              </div>
              <p className="mt-3 max-w-md text-sm text-white/85">
                Write this mark on every package sent to our warehouses so we can identify it as yours.
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
            <h2 className="font-display text-xl font-bold text-brand-navy">Ship your goods to our warehouses</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {warehouses?.filter((w) => w.code !== "GH").map((w) => (
              <Card key={w.code} className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-display text-lg font-bold text-brand-navy">{w.name}</div>
                  <span className="rounded-md bg-brand-orange/10 px-2 py-0.5 text-xs font-semibold uppercase text-brand-orange">
                    {w.country}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Recipient: <span className="font-semibold text-foreground">NDL {w.code} — {profile?.shipping_mark ?? ""}</span></div>
                  {w.address_line1 && <div>{w.address_line1}</div>}
                  {w.address_line2 && <div>{w.address_line2}</div>}
                  {w.city && <div>{w.city}</div>}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Placeholder tiles */}
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Package, t: "My packages", d: "Track packages received at our origin warehouses." },
            { icon: PackageSearch, t: "Shipments", d: "See consolidations and ETAs to Ghana." },
            { icon: MapPin, t: "Deliveries", d: "Book last-mile delivery and view POD." },
          ].map((s) => (
            <Card key={s.t} className="p-5">
              <div className="mb-3 inline-flex rounded-lg bg-brand-navy/5 p-2 text-brand-navy">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-lg font-bold text-brand-navy">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              <div className="mt-3 text-xs text-muted-foreground">Coming soon</div>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
