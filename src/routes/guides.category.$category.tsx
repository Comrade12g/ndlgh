import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { AnimatedBackdrop } from "@/components/marketing/AnimatedBackdrop";
import { GuideCard } from "@/components/marketing/GuideCard";
import { GUIDE_CATEGORIES, SITE_URL, getCategory, mergeGuides, type Guide, type GuideCategorySlug } from "@/content/guides";
import { listPublishedGuides } from "@/lib/guides.functions";
import { GuideLeadCta } from "@/components/marketing/GuideLeadCta";
import { useReveal } from "@/hooks/use-reveal";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/guides/category/$category")({
  loader: async ({ params }): Promise<{ category: ReturnType<typeof getCategory> & object; guides: Guide[] }> => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    const guides = mergeGuides((await listPublishedGuides()) as Guide[]).filter(
      (g) => g.category === (category.slug as GuideCategorySlug),
    );
    return { category, guides };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Guides — Not found" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.category;
    const title = `${c.name} — NDL Cargo Ghana Shipping Guides`;
    const desc = c.description;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/guides/category/${c.slug}` }],
    };
  },
  component: CategoryPage,
  notFoundComponent: CategoryNotFound,
});

function CategoryPage() {
  const { category, guides: posts } = Route.useLoaderData() as {
    category: { slug: string; name: string; tagline: string; description: string };
    guides: Guide[];
  };
  const grid = useReveal<HTMLDivElement>();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `${SITE_URL}/guides/category/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/guides/${g.slug}`,
        name: g.title,
      })),
    },
  };

  return (
    <MarketingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden border-b bg-gradient-to-b from-brand-navy to-[#0d2551] py-14 text-white md:py-18">
        <AnimatedBackdrop />
        <div className="relative mx-auto max-w-7xl px-4">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="px-2">/</span>
            <Link to="/guides" className="hover:text-white">Guides</Link>
            <span className="px-2">/</span>
            <span className="text-white">{category.name}</span>
          </nav>
          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-orange">
            {category.tagline}
          </div>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-black md:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">{category.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div ref={grid} className="reveal grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((g, i) => (
            <GuideCard key={g.slug} guide={g} eager={i < 3} />
          ))}
        </div>

        <GuideLeadCta
          className="mt-14"
          sourcePath={`/guides/category/${category.slug}`}
        />

        <div className="mt-14 border-t pt-8">
          <h2 className="font-display text-xl font-bold">Other topics</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {GUIDE_CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
              <Link
                key={c.slug}
                to="/guides/category/$category"
                params={{ category: c.slug }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-brand-orange/60 hover:text-brand-orange"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function CategoryNotFound() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-black">Topic not found</h1>
        <p className="mt-3 text-muted-foreground">
          That guide category doesn't exist. Browse all of our shipping guides instead.
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
