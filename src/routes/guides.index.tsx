import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { AnimatedBackdrop } from "@/components/marketing/AnimatedBackdrop";
import { GuideCard } from "@/components/marketing/GuideCard";
import { GUIDE_CATEGORIES, SITE_URL, mergeGuides, type Guide } from "@/content/guides";
import { listPublishedGuides } from "@/lib/guides.functions";
import { GuideLeadCta } from "@/components/marketing/GuideLeadCta";
import { useReveal } from "@/hooks/use-reveal";
import { ArrowRight } from "lucide-react";

const TITLE = "Shipping Guides Ghana — Costs, Customs Duty & Import How-Tos";
const DESC =
  "Free guides on shipping to Ghana: China to Accra freight costs, Tema Port customs duty explained, sea vs air cargo, shipping marks and tracking milestones.";

export const Route = createFileRoute("/guides/")({
  loader: async (): Promise<{ guides: Guide[] }> => ({
    guides: mergeGuides((await listPublishedGuides()) as Guide[]),
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/guides` }],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  const { guides } = Route.useLoaderData() as { guides: Guide[] };
  const grid = useReveal<HTMLDivElement>();
  const cats = useReveal<HTMLDivElement>();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "NDL Cargo Ghana Shipping Guides",
    description: DESC,
    url: `${SITE_URL}/guides`,
    blogPost: guides.map((g) => ({
      "@type": "BlogPosting",
      headline: g.title,
      description: g.description,
      datePublished: g.updated,
      dateModified: g.updated,
      url: `${SITE_URL}/guides/${g.slug}`,
      author: { "@type": "Organization", name: "NDL Cargo Ghana" },
    })),
  };

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <section className="relative overflow-hidden border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-16 text-white md:py-20">
        <AnimatedBackdrop />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            Guides &amp; insights
          </div>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-black md:text-5xl">
            Shipping to Ghana, explained properly
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Practical, numbers-first guides from our clearing and consolidation teams — what freight
            really costs from China, Dubai, Thailand, Canada and the US, how GRA calculates duty at
            Tema Port, and how to move cargo without surprises.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
            >
              Get a freight quote <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tracking"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Track a shipment
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-2xl font-bold">Browse by topic</h2>
        <div ref={cats} className="reveal mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GUIDE_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/guides/category/$category"
              params={{ category: c.slug }}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-brand-orange/50 hover:shadow-lg"
            >
              <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-sky">
                {c.tagline}
              </div>
              <div className="mt-2 font-display text-lg font-bold">{c.name}</div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange">
                View guides
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="font-display text-2xl font-bold">Latest guides</h2>
        <div ref={grid} className="reveal mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => (
            <GuideCard key={g.slug} guide={g} eager={i < 3} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <GuideLeadCta sourcePath="/guides" />
      </section>
    </MarketingLayout>
  );
}
