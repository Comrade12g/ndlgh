import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout, NDL_ADDRESS, NDL_EMAIL, NDL_PHONE, NDL_PHONE_INTL } from "@/components/marketing/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NDL Cargo Ghana — Accra office, WhatsApp & phone" },
      { name: "description", content: `Contact NDL Cargo: ${NDL_ADDRESS}. Phone/WhatsApp ${NDL_PHONE}, email ${NDL_EMAIL}.` },
      { property: "og:title", content: "Contact NDL Cargo Ghana" },
      { property: "og:description", content: `NDL Cargo office: ${NDL_ADDRESS}. Phone/WhatsApp ${NDL_PHONE}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <MarketingLayout>
      <section className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Contact</div>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Let's get your cargo moving.</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Visit our Accra office, call, or chat with us on WhatsApp — the fastest way to reach the operations team.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <ContactCard icon={MapPin} title="Office" value={NDL_ADDRESS} note="Accra, Ghana" />
          <ContactCard icon={Phone} title="Phone" value={NDL_PHONE} note="Mon–Sat 8am–6pm" href={`tel:${NDL_PHONE}`} />
          <ContactCard icon={Mail} title="Email" value={NDL_EMAIL} note="Replies within 1 business day" href={`mailto:${NDL_EMAIL}`} />
        </div>

        <Card className="mt-8 overflow-hidden bg-gradient-to-br from-[#25D366]/10 via-transparent to-brand-orange/10">
          <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#128C7E]">
                <MessageCircle className="h-3 w-3" /> Fastest reply
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">Chat on WhatsApp</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask a question, request a quote, or check on your shipment. Our team replies fast during business hours.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-[#25D366] hover:bg-[#25D366]/90"
              onClick={() => openWhatsApp(NDL_PHONE_INTL, "Hello NDL Cargo, I'd like to get in touch.")}
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Open WhatsApp
            </Button>
          </div>
        </Card>

        <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
          <Card className="overflow-hidden p-0">
            <iframe
              title="NDL Cargo Ghana office location"
              src="https://www.google.com/maps?q=Derby+Avenue+Accra+Ghana&output=embed"
              className="h-[420px] w-full border-0"
              loading="lazy"
            />
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-brand-orange">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Opening hours</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <Row d="Monday – Friday" t="8:00 – 18:00" />
              <Row d="Saturday" t="9:00 – 14:00" />
              <Row d="Sunday" t="Closed" />
            </ul>
            <div className="mt-6 border-t pt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-orange">Also here</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>WhatsApp Business: {NDL_PHONE}</li>
                <li>Email: {NDL_EMAIL}</li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "NDL Cargo Ghana",
            address: { "@type": "PostalAddress", streetAddress: NDL_ADDRESS, addressLocality: "Accra", addressCountry: "GH" },
            telephone: NDL_PHONE,
            email: NDL_EMAIL,
            openingHours: ["Mo-Fr 08:00-18:00", "Sa 09:00-14:00"],
          }),
        }}
      />
    </MarketingLayout>
  );
}

function ContactCard({ icon: Icon, title, value, note, href }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string; note: string; href?: string }) {
  const Inner = (
    <Card className="h-full p-6 transition-shadow hover:shadow-lg">
      <div className="rounded-lg bg-brand-orange/10 p-2.5 w-fit text-brand-orange"><Icon className="h-5 w-5" /></div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 font-display text-lg font-bold text-brand-navy">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{note}</div>
    </Card>
  );
  return href ? <a href={href}>{Inner}</a> : Inner;
}

function Row({ d, t }: { d: string; t: string }) {
  return (
    <li className="flex items-center justify-between border-b pb-2 last:border-0">
      <span>{d}</span>
      <span className="font-mono text-sm font-bold tabular-nums text-brand-navy">{t}</span>
    </li>
  );
}
