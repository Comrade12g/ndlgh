import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { name: "Ama Boateng", role: "Boutique owner, Accra", text: "NDL cleared my Guangzhou consignment in 3 days and delivered to my shop. Fastest I've ever had.", rating: 5, photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=70" },
  { name: "Kwame Mensah", role: "Electronics importer", text: "Their WhatsApp updates every step of the way are honestly a game changer. No more guessing.", rating: 5, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=70" },
  { name: "Nana Adjoa", role: "Kumasi retailer", text: "The instant quote engine is real. Booked a Yiwu shipment in under 3 minutes.", rating: 5, photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=70" },
  { name: "Michael O.", role: "Auto parts, Tema", text: "Sourcing agents on the ground in China + customs in-house = zero drama for me.", rating: 5, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70" },
  { name: "Sarah D.", role: "E-commerce founder", text: "From New York to Ghana door delivery in 12 days. I trust them with every launch.", rating: 5, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70" },
];

export function Testimonials() {
  const ref = useReveal<HTMLDivElement>();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div ref={ref} className="reveal text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">Voices</div>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-brand-navy md:text-4xl">
          What our customers say
        </h2>
      </div>

      <div className="reveal mt-10 grid items-center gap-6 md:grid-cols-[80px_1fr_80px]">
        <button
          onClick={() => setI((v) => (v - 1 + ITEMS.length) % ITEMS.length)}
          className="hidden h-12 w-12 items-center justify-center rounded-full border bg-card text-brand-navy transition hover:border-brand-orange hover:text-brand-orange md:flex md:justify-self-end"
          aria-label="Previous"
        >‹</button>

        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-white to-secondary/40 p-8 shadow-xl md:p-12">
          <Quote className="absolute right-6 top-6 h-16 w-16 text-brand-orange/10" />
          <div className="relative min-h-[140px]">
            {ITEMS.map((it, idx) => (
              <div
                key={it.name}
                className={cn(
                  "absolute inset-0 transition-all duration-500",
                  idx === i ? "translate-x-0 opacity-100" : idx < i ? "-translate-x-8 opacity-0" : "translate-x-8 opacity-0",
                )}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: it.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="mt-3 text-lg font-medium text-brand-navy md:text-xl">"{it.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <img
                    src={it.photo}
                    alt={it.name}
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-orange/40"
                  />

                  <div>
                    <div className="font-semibold text-brand-navy">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.role}</div>
                  </div>
                </div>
              </div>
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
          aria-label="Next"
        >›</button>
      </div>
    </section>
  );
}
