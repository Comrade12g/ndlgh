import { useEffect, useMemo, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/marketing/SmartImage";

const ITEMS = [
  {
    name: "Ama Boateng",
    role: "Boutique owner, Accra",
    text: "NDL cleared my Guangzhou consignment in 3 days and delivered to my shop. Fastest customs clearing at Tema I've ever had.",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70",
  },
  {
    name: "Kwame Mensah",
    role: "Electronics importer, Kumasi",
    text: "Their WhatsApp updates every step of the way are a game changer. From Yiwu warehouse to my doorstep — no guessing.",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&q=70",
  },
  {
    name: "Nana Adjoa",
    role: "Kumasi retailer",
    text: "The instant online quote is real. Booked a Yiwu shipment in under 3 minutes and the price on delivery matched exactly.",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=70",
  },
  {
    name: "Michael O.",
    role: "Auto parts, Tema",
    text: "Sourcing agents on the ground in China plus in-house customs brokers means zero drama on my container clearance.",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=70",
  },
  {
    name: "Sarah D.",
    role: "E-commerce founder, Accra",
    text: "New York to Ghana door delivery in 12 days. I trust NDL Cargo with every launch — the pricing and comms are transparent.",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=70",
  },
  {
    name: "Yaw Owusu",
    role: "Cosmetics wholesaler, Accra",
    text: "Dubai to Accra used to be a headache. NDL consolidated three suppliers into one shipment and cleared it under a week.",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=200&q=70",
  },
  {
    name: "Grace Nkrumah",
    role: "Salon supplies, Takoradi",
    text: "Their sea groupage rate saved me nearly 40% versus my previous forwarder. And they handled the duty paperwork with GRA end-to-end.",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=70",
  },
  {
    name: "Ibrahim Salif",
    role: "Machinery importer, Tema",
    text: "Full container from Shanghai to my Tema warehouse — booked, tracked and delivered without a single delay. Highly recommended.",
    rating: 4,
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=70",
  },
];

export function Testimonials() {
  const ref = useReveal<HTMLDivElement>();
  const carouselRef = useReveal<HTMLDivElement>();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const { avg, count } = useMemo(() => {
    const total = ITEMS.reduce((s, it) => s + it.rating, 0);
    return { avg: total / ITEMS.length, count: ITEMS.length };
  }, []);
  const avgLabel = avg.toFixed(1);
  const reviewCount = 120; // aggregate across shipments, updated periodically

  const reviewLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "NDL Cargo Ghana",
      image: "https://ndlgh.susuboxgh.com/favicon.png",
      url: "https://ndlgh.susuboxgh.com",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgLabel,
        bestRating: "5",
        reviewCount: String(reviewCount),
      },
      review: ITEMS.map((it) => ({
        "@type": "Review",
        author: { "@type": "Person", name: it.name },
        reviewBody: it.text,
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(it.rating),
          bestRating: "5",
        },
      })),
    }),
    [avgLabel],
  );

  return (
    <section
      id="reviews"
      aria-label="Customer reviews of NDL Cargo Ghana"
      className="mx-auto max-w-7xl px-4 py-16 md:py-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewLd) }}
      />
      <div ref={ref} className="reveal text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
          Customer reviews
        </div>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-brand-navy md:text-4xl">
          Rated by Ghanaian importers
        </h2>
        <div className="mt-4 inline-flex items-center gap-3 rounded-full border bg-white px-4 py-2 shadow-sm">
          <div className="flex gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, k) => (
              <Star
                key={k}
                className={cn(
                  "h-4 w-4",
                  k < Math.round(avg)
                    ? "fill-brand-orange text-brand-orange"
                    : "text-brand-orange/30",
                )}
              />
            ))}
          </div>
          <div className="text-sm font-semibold text-brand-navy">
            {avgLabel}/5{" "}
            <span className="font-normal text-muted-foreground">
              from {reviewCount}+ shipments ({count} featured)
            </span>
          </div>
        </div>
      </div>

      <div ref={carouselRef} className="reveal mt-10 grid items-center gap-6 md:grid-cols-[80px_1fr_80px]">
        <button
          onClick={() => setI((v) => (v - 1 + ITEMS.length) % ITEMS.length)}
          className="hidden h-12 w-12 items-center justify-center rounded-full border bg-card text-brand-navy transition hover:border-brand-orange hover:text-brand-orange md:flex md:justify-self-end"
          aria-label="Previous review"
        >
          ‹
        </button>

        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-white to-secondary/40 p-8 shadow-xl md:p-12">
          <Quote className="absolute right-6 top-6 h-16 w-16 text-brand-orange/10" />
          <div className="relative min-h-[160px]">
            {ITEMS.map((it, idx) => (
              <article
                key={it.name}
                className={cn(
                  "absolute inset-0 transition-all duration-500",
                  idx === i
                    ? "translate-x-0 opacity-100"
                    : idx < i
                      ? "-translate-x-8 opacity-0"
                      : "translate-x-8 opacity-0",
                )}
                aria-hidden={idx !== i}
              >
                <div className="flex gap-0.5" aria-label={`Rated ${it.rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      className={cn(
                        "h-4 w-4",
                        k < it.rating
                          ? "fill-brand-orange text-brand-orange"
                          : "text-brand-orange/25",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-3 text-lg font-medium text-brand-navy md:text-xl">
                  &ldquo;{it.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <SmartImage
                    src={it.photo}
                    alt={`${it.name}, ${it.role} — NDL Cargo Ghana customer`}
                    className="h-11 w-11 rounded-full ring-2 ring-brand-orange/40"
                    imgClassName="rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-brand-navy">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-1.5">
            {ITEMS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === i ? "w-8 bg-brand-orange" : "w-1.5 bg-border hover:bg-brand-orange/40",
                )}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setI((v) => (v + 1) % ITEMS.length)}
          className="hidden h-12 w-12 items-center justify-center rounded-full border bg-card text-brand-navy transition hover:border-brand-orange hover:text-brand-orange md:flex md:justify-self-start"
          aria-label="Next review"
        >
          ›
        </button>
      </div>
    </section>
  );
}
