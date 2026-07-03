import { createFileRoute, Link } from "@tanstack/react-router";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo, LogoLockup } from "@/components/brand/Logo";
import {
  PackageSearch,
  Ship,
  Container,
  Plane,
  Truck,
  ShieldCheck,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [code, setCode] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <LogoLockup compact />
          <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 md:flex">
            <a href="#services" className="hover:text-brand-orange">Services</a>
            <a href="#track" className="hover:text-brand-orange">Track</a>
            <a href="#how" className="hover:text-brand-orange">How it works</a>
            <a href="#contact" className="hover:text-brand-orange">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="text-brand-navy hover:text-brand-orange">Sign in</Button>
            </Link>
            <Link to="/auth" search={{ mode: "signup" } as never}>
              <Button className="bg-brand-orange text-white hover:bg-brand-orange/90">Get shipping mark</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-sky/80" />
        <div className="absolute -right-40 top-10 -z-10 h-[500px] w-[500px] rounded-full bg-brand-orange/20 blur-3xl" />

        <HeroBackdrop />


        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="text-white">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              China · UK · Dubai → Ghana
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Ship the world to your <span className="text-brand-orange">doorstep</span> in Ghana.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Sea groupage, full containers, air freight, and intercity delivery — all
              tracked from origin warehouse to your customer's door. Built for e-commerce,
              importers, and traders.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                <Button size="lg" className="bg-brand-orange text-white hover:bg-brand-orange/90">
                  Get your shipping mark <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#track">
                <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                  <PackageSearch className="mr-2 h-4 w-4" /> Track a shipment
                </Button>
              </a>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-white/80">
              {[
                { k: "3", v: "Origin hubs" },
                { k: "10k+", v: "Parcels handled" },
                { k: "24/7", v: "Portal access" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-3xl font-extrabold text-white">{s.k}</div>
                  <div className="text-xs uppercase tracking-wider">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Track card */}
          <div id="track" className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
                <PackageSearch className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-brand-navy">Track your shipment</h2>
                <p className="text-sm text-muted-foreground">Enter tracking number or shipping mark</p>
              </div>
            </div>
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const c = code.trim();
                if (c) window.location.href = `/track/${encodeURIComponent(c)}`;
              }}
            >
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. NDL-GH-01234 or TRK-98721"
                className="h-12 text-base"
              />
              <Button type="submit" size="lg" className="w-full bg-brand-navy hover:bg-brand-navy/90">
                Track shipment
              </Button>
            </form>
            <div className="mt-6 rounded-lg bg-muted p-4 text-xs text-muted-foreground">
              <div className="mb-1 font-semibold text-brand-navy">New to NDL Ghana?</div>
              Sign up to get your unique <span className="font-mono text-brand-orange">NDL-GH-#####</span> shipping mark
              and our overseas warehouse addresses in China, UK, and Dubai.
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Our services</div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-navy md:text-4xl">
            End-to-end shipping, sourcing & delivery
          </h2>
          <p className="mt-3 text-muted-foreground">
            Whether you're buying from 1688, ordering from Amazon UK, or moving a full 40ft container,
            NDL handles pickup, freight, clearing, and last-mile.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Ship, title: "Sea Groupage (LCL)", desc: "Priced per CBM. Weekly consolidations from China, UK, and Dubai." },
            { icon: Container, title: "Full Container (FCL)", desc: "20ft and 40ft containers direct to Tema/Takoradi port." },
            { icon: Plane, title: "Air Freight", desc: "Fast air cargo priced per kg for urgent shipments and small parcels." },
            { icon: Truck, title: "Intercity Ghana", desc: "Last-mile delivery to any city in Ghana with signature POD." },
          ].map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand-orange/50 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-brand-navy/5 p-3 text-brand-navy group-hover:bg-brand-orange/10 group-hover:text-brand-orange">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-brand-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-brand-navy/[0.03] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">How it works</div>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-brand-navy md:text-4xl">
              Four simple steps
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { n: "01", t: "Sign up", d: "Get your unique NDL-GH shipping mark and our warehouse addresses." },
              { n: "02", t: "Ship to us", d: "Send your parcels to our China, UK, or Dubai warehouse." },
              { n: "03", t: "We consolidate", d: "We weigh, measure, photograph, and load your goods." },
              { n: "04", t: "Delivered", d: "Track live, pay online, and receive at your doorstep." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-card p-6">
                <div className="font-display text-4xl font-extrabold text-brand-orange/80">{s.n}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-brand-navy">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 rounded-2xl border bg-gradient-to-br from-brand-navy to-brand-sky p-8 text-white md:grid-cols-3 md:p-10">
          {[
            { icon: ShieldCheck, t: "Insured & tracked", d: "Every package photographed and logged." },
            { icon: MapPin, t: "3 overseas hubs", d: "China (Guangzhou), UK (London), Dubai." },
            { icon: Truck, t: "Door delivery", d: "Signature-captured last-mile in Ghana." },
          ].map((s) => (
            <div key={s.t} className="flex items-start gap-4">
              <div className="rounded-lg bg-white/15 p-3">
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-lg font-bold">{s.t}</div>
                <div className="text-sm text-white/80">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <LogoLockup />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              NDL Ghana — Global Shipping. E-commerce & Intercity VIN.
            </p>
          </div>
          <div>
            <div className="font-display font-bold text-brand-navy">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-brand-orange">Services</a></li>
              <li><a href="#how" className="hover:text-brand-orange">How it works</a></li>
              <li><Link to="/auth" className="hover:text-brand-orange">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-display font-bold text-brand-navy">Contact</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Accra, Ghana</li>
              <li>hello@ndlghana.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NDL Ghana. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
