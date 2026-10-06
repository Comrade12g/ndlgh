import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ServiceRequestForm } from "@/components/marketing/ServiceRequestForm";
import { Button } from "@/components/ui/button";
import { Wallet, Search, GraduationCap, Warehouse, Ship, ChevronDown, ArrowRight } from "lucide-react";

const BASE = "https://ndlgh.susuboxgh.com";
const TITLE = "Pay Suppliers in China & Buy from China | NDL Cargo Ghana";
const DESC =
  "Pay Chinese suppliers, source products and learn to import. NDL Cargo handles procurement, supplier payments and shipping to Ghana.";

export const Route = createFileRoute("/buy-from-china")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "pay Chinese suppliers from Ghana, buy from China to Ghana, China procurement agent Ghana, learn to import from China, how to pay a supplier in China from Ghana" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${BASE}/buy-from-china` }],
  }),
  component: BuyFromChinaPage,
});

const SERVICES = [
  { id: "supplier-payments", icon: Wallet, name: "Supplier Payments", short: "Pay your suppliers in China",
    desc: "Tell us who you need to pay in China and how much. Our team contacts you to arrange payment to your supplier. Fees and payment methods: [CONFIRM]." },
  { id: "procurement", icon: Search, name: "Procurement & Sourcing", short: "We find and buy products for you",
    desc: "Tell us what you want to buy. Our China team can help find products and suppliers in Guangzhou and Yiwu and coordinate your order." },
  { id: "training", icon: GraduationCap, name: "Import Training", short: "Learn to import from China",
    desc: "Training on procurement and supplier payments for people who want to start or grow an import business." },
];

const STEPS = [
  { icon: Search, t: "1. Find products", d: "Tell us what you need, or share your supplier's details." },
  { icon: Wallet, t: "2. Pay the supplier", d: "We arrange payment to your supplier in China." },
  { icon: Warehouse, t: "3. Receive at our warehouse", d: "Goods arrive at our Guangzhou or Yiwu warehouse with your mark." },
  { icon: Ship, t: "4. Ship to Ghana", d: "Sea freight from $230/CBM, 35 to 45 days. Customs clearing included for LCL." },
];

const FAQS = [
  { q: "How can I pay a supplier in China from Ghana?", a: "Send a supplier payment request using the form on this page. Our team will contact you on WhatsApp to arrange payment to your supplier. Fees and payment methods: [CONFIRM]." },
  { q: "Can NDL buy goods for me in China?", a: "Yes. NDL offers procurement and sourcing. Tell us what you want to buy and our team will help find products and suppliers, then receive the goods at our Guangzhou or Yiwu warehouse and ship them to Ghana." },
  { q: "Does NDL teach importing?", a: "Yes. NDL offers training on procurement and supplier payments. Next session dates: [CONFIRM]. Register your interest with the Learn to import form." },
  { q: "What is the sea freight rate from China to Ghana?", a: "Sea freight from China to Ghana is $230 per CBM. Whether government duties and taxes are included: [CONFIRM]." },
  { q: "Is customs clearing included?", a: "Customs clearing is included for groupage/LCL shipments. For full containers (FCL), NDL's in-house agents handle clearing." },
  { q: "How long does shipping from China take?", a: "Sea freight from China to Ghana takes 35 to 45 days." },
];

function BuyFromChinaPage() {
  const [open, setOpen] = useState<number | null>(0);
  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ...SERVICES.map((s) => ({
      "@context": "https://schema.org", "@type": "Service", name: s.name, description: s.desc,
      provider: { "@id": `${BASE}/#business` }, areaServed: "GH", url: `${BASE}/buy-from-china#${s.id}`,
    })),
  ];
  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-16 text-white md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Buy from China</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Pay suppliers in China and buy from China — one process</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            NDL Cargo can find products, pay your suppliers, receive goods at our Guangzhou or Yiwu warehouse and ship them to Ghana.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#request"><Button className="bg-brand-orange hover:bg-brand-orange/90">Send a request <ArrowRight className="ml-2 h-4 w-4" /></Button></a>
            <a href="#learn"><Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">Learn to import</Button></a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-black text-brand-navy">How Order and Pay works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.t} className="rounded-xl border bg-card p-5">
              <div className="w-fit rounded-lg bg-brand-orange/10 p-2 text-brand-orange"><s.icon className="h-5 w-5" /></div>
              <div className="mt-3 font-display font-bold text-brand-navy">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-24 rounded-2xl border bg-card p-6">
              <div className="w-fit rounded-lg bg-brand-sky/10 p-2.5 text-brand-sky"><s.icon className="h-6 w-6" /></div>
              <h2 className="mt-4 font-display text-xl font-bold text-brand-navy">{s.name}</h2>
              <p className="text-sm font-medium text-brand-orange">{s.short}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="request" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16">
        <h2 className="font-display text-3xl font-black text-brand-navy">Request supplier payment, procurement or shipping</h2>
        <p className="mt-2 text-muted-foreground">Fill in what you can — our team will follow up on WhatsApp.</p>
        <div className="mt-6"><ServiceRequestForm /></div>
      </section>

      <section id="learn" className="bg-secondary/40 py-16 scroll-mt-24">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-3xl font-black text-brand-navy">Learn to import</h2>
          <p className="mt-2 text-muted-foreground">Training on procurement and supplier payments. Next session dates: [CONFIRM].</p>
          <div className="mt-6"><ServiceRequestForm variant="training" /></div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-black text-brand-navy">Frequently asked questions</h2>
        <div className="mt-8 divide-y rounded-2xl border bg-card">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="font-display font-bold text-brand-navy">{f.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-brand-orange transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <div className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</div>}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/quote"><Button variant="outline">Get a shipping quote</Button></Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
