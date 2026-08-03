import { Link } from "@tanstack/react-router";
import { SmartImage } from "@/components/marketing/SmartImage";
import { small } from "@/assets/gallery";
import { ArrowRight, Clock } from "lucide-react";
import { formatGuideDate, getCategory, type Guide } from "@/content/guides";

export function GuideCard({ guide, eager = false }: { guide: Guide; eager?: boolean }) {
  const cat = getCategory(guide.category);
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <Link
        to="/guides/$slug"
        params={{ slug: guide.slug }}
        className="block"
        aria-label={guide.title}
      >
        <SmartImage
          src={small(guide.image)}
          alt={guide.imageAlt}
          aspect="aspect-[16/9]"
          eager={eager}
          sizes="(max-width: 768px) 100vw, 33vw"
          imgClassName="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="p-5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-orange">
            {cat?.name}
          </div>
          <h3 className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
            {guide.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{guide.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {guide.readMinutes} min read
            </span>
            <span>{formatGuideDate(guide.updated)}</span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-sky">
            Read guide
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
}
