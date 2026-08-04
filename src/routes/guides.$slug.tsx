import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { SmartImage } from "@/components/marketing/SmartImage";
import { GuideCard } from "@/components/marketing/GuideCard";
import {
  SITE_URL,
  mergeGuides,
  formatGuideDate,
  getCategory,
  type Guide,
} from "@/content/guides";
import { listPublishedGuides } from "@/lib/guides.functions";
import { GuideLeadCta } from "@/components/marketing/GuideLeadCta";
import { useReveal } from "@/hooks/use-reveal";
import { ArrowRight, Clock, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ params }) => {
    const all = mergeGuides(await listPublishedGuides());
    const guide = all.find((g) => g.slug === params.slug);
    if (!guide) throw notFound();
    const related = all
      .filter((g) => g.slug !== guide.slug)
      .sort((a, b) => Number(b.category === guide.category) - Number(a.category === guide.category))
      .slice(0, 3);
    return { guide, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Guide not found" }, { name: "robots", content: "noindex" }] };
    }
    const g = loaderData.guide;
    const url = `${SITE_URL}/guides/${g.slug}`;
    const image = `${SITE_URL}${g.image}`;
    return {
      meta: [
        { title: g.seoTitle },
        { name: "description", content: g.description },
        { name: "keywords", content: g.keywords.join(", ") },
        { name: "author", content: "NDL Cargo Ghana" },
        { property: "og:title", content: g.seoTitle },
        { property: "og:description", content: g.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "article:published_time", content: g.updated },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: g.seoTitle },
        { name: "twitter:description", content: g.description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: GuidePost,
  notFoundComponent: GuideNotFound,
});

function GuidePost() {
  const { guide, related } = Route.useLoaderData() as { guide: Guide; related: Guide[] };
  const cat = getCategory(guide.category)!;
  const body = useReveal<HTMLDivElement>();

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: guide.title,
      description: guide.description,
      image: `${SITE_URL}${guide.image}`,
      datePublished: guide.updated,
      dateModified: guide.updated,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      articleSection: cat.name,
      keywords: guide.keywords.join(", "),
      author: { "@type": "Organization", name: "NDL Cargo Ghana", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "NDL Cargo Ghana",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
        {
          "@type": "ListItem",
          position: 3,
          name: cat.name,
          item: `${SITE_URL}/guides/category/${cat.slug}`,
        },
        { "@type": "ListItem", position: 4, name: guide.title, item: url },
      ],
    },
    ...(guide.faqs.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <header className="border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-12 text-white md:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <nav aria-label="Breadcrumb" className="text-xs text-white/70">
              <Link to="/" className="hover:text-white">Home</Link>
              <span className="px-2">/</span>
              <Link to="/guides" className="hover:text-white">Guides</Link>
              <span className="px-2">/</span>
              <Link
                to="/guides/category/$category"
                params={{ category: cat.slug }}
                className="hover:text-white"
              >
                {cat.name}
              </Link>
            </nav>
            <h1 className="mt-4 font-display text-3xl font-black leading-tight md:text-4xl">
              {guide.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/75">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand-orange" />
                Updated {formatGuideDate(guide.updated)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand-orange" />
                {guide.readMinutes} min read
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold uppercase tracking-widest">
                {cat.tagline}
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-10">
          <SmartImage
            src={guide.image}
            alt={guide.imageAlt}
            aspect="aspect-[16/9]"
            eager
            prefetch
            sizes="(max-width: 768px) 100vw, 768px"
            className="overflow-hidden rounded-2xl"
          />

          <div ref={body} className="reveal">
            {guide.intro.map((p, i) => (
              <p key={i} className="mt-6 text-lg leading-relaxed text-foreground/90">
                {p}
              </p>
            ))}

            {guide.sections.length > 1 && (
              <nav className="mt-10 rounded-2xl border border-border bg-secondary/50 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
                  In this guide
                </div>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                  {guide.sections.map((s, i) => (
                    <li key={i}>
                      <a href={`#section-${i}`} className="hover:text-brand-sky hover:underline">
                        {s.h}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {guide.sections.map((s, i) => (
              <section key={i} id={`section-${i}`} className="mt-10 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold text-foreground">{s.h}</h2>
                {s.p?.map((p, j) => (
                  <p key={j} className="mt-4 leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-4 space-y-2">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3 text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.table && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          {s.table.head.map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((r, j) => (
                          <tr key={j} className="border-t border-border">
                            {r.map((c, k) => (
                              <td key={k} className="px-4 py-3 text-muted-foreground">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            {guide.faqs.length > 0 && (
              <section className="mt-14">
                <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
                <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
                  {guide.faqs.map((f, i) => (
                    <div key={i} className="p-5">
                      <h3 className="font-semibold text-foreground">{f.q}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <GuideLeadCta className="mt-14" sourcePath={`/guides/${guide.slug}`} />

            <aside className="mt-14 rounded-2xl bg-brand-navy p-7 text-white">
              <h2 className="font-display text-2xl font-bold">Ready to ship?</h2>
              <p className="mt-2 max-w-xl text-sm text-white/80">
                Get an indicative sea or air rate in seconds, or talk to our clearing team about your
                commodity before you buy.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/quote"
                  className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                >
                  Get a quote <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Talk to us
                </Link>
              </div>
            </aside>
          </div>
        </div>

        <section className="border-t bg-secondary/40 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="font-display text-2xl font-bold">Keep reading</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </div>
        </section>
      </article>
    </MarketingLayout>
  );
}

function GuideNotFound() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-black">Guide not found</h1>
        <p className="mt-3 text-muted-foreground">
          That guide has moved or never existed. Browse the full library instead.
        </p>
        <Link
          to="/guides"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white"
        >
          All guides <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </MarketingLayout>
  );
}
