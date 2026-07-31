import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { SmartImage, prefetchImages } from "./SmartImage";
import { cn } from "@/lib/utils";

export type CarouselSlide = {
  src: string;
  alt: string;
  caption?: string;
  location?: string;
};

type Props = {
  slides: CarouselSlide[];
  interval?: number;
  className?: string;
};

export function HeroCarousel({ slides, interval = 5200, className }: Props) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || slides.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [playing, slides.length, interval]);

  // Prefetch next 2 slides for smoothness
  useEffect(() => {
    if (slides.length === 0) return;
    const next = [
      slides[(i + 1) % slides.length]?.src,
      slides[(i + 2) % slides.length]?.src,
    ].filter(Boolean) as string[];
    prefetchImages(next);
  }, [i, slides]);

  if (slides.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-white/15 bg-brand-navy shadow-2xl", className)}>
      <div className="relative aspect-[4/3] w-full md:aspect-[16/10]">
        {slides.map((s, idx) => {
          // Only mount the current slide and its neighbours so the hero never
          // downloads the whole deck up front.
          const near =
            idx === i ||
            idx === (i + 1) % slides.length ||
            idx === (i - 1 + slides.length) % slides.length;
          if (!near) return null;
          return (
          <div
            key={s.src + idx}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-out",
              idx === i ? "scale-100 opacity-100" : "scale-105 opacity-0",
            )}
            aria-hidden={idx !== i}
          >
            <SmartImage
              src={s.src}
              alt={s.alt}
              className="h-full w-full"
              imgClassName="animate-[float-y_16s_ease-in-out_infinite]"
              eager={idx === 0}
              prefetch={idx === 0}
              sizes="(max-width: 768px) 100vw, 720px"
              width={idx === 0 ? 1600 : undefined}
              height={idx === 0 ? 1000 : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/25 to-transparent" />
            {(s.caption || s.location) && (
              <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                {s.location && (
                  <div className="mb-1 inline-flex rounded-full bg-brand-orange/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                    {s.location}
                  </div>
                )}
                {s.caption && (
                  <div className="font-display text-lg font-black leading-tight md:text-2xl">
                    {s.caption}
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Controls */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-brand-orange"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => setI((v) => (v + 1) % slides.length)}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-brand-orange"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={playing ? "Pause carousel" : "Play carousel"}
        onClick={() => setPlaying((p) => !p)}
        className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-brand-orange"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === i ? "w-8 bg-brand-orange" : "w-2 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}
