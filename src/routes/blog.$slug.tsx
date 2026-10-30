import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { BlogCard, BlogError, BlogHtml, BlogImage, BlogMeta, BlogNotFound, BlogSkeleton } from "@/components/marketing/Blog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getBlogPost } from "@/lib/blog.functions";
import { blogDescription, blogFaqs, jsonLd } from "@/lib/blog";
import { BUSINESS } from "@/config/business";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.slug)) throw notFound();
    const result = await getBlogPost({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: `Article unavailable | ${BUSINESS.name}` }, { name: "description", content: "This article is unavailable." }, { name: "robots", content: "noindex" }, { property: "og:title", content: `Article unavailable | ${BUSINESS.name}` }, { property: "og:description", content: "This article is unavailable." }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] };
    const title = `${post.title} | ${BUSINESS.name}`;
    const description = blogDescription(post);
    const url = `${BUSINESS.domain}/blog/${post.slug}`;
    const image = post.hero_image_url?.startsWith("https://") ? post.hero_image_url : null;
    return { meta: [
      { title }, { name: "description", content: description },
      ...(post.meta_keywords ? [{ name: "keywords", content: post.meta_keywords }] : []),
      { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" }, { name: "twitter:title", content: title }, { name: "twitter:description", content: description },
      ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
    ], links: [{ rel: "canonical", href: url }, ...(image ? [{ rel: "preload", as: "image", href: image }] : [])] };
  },
  component: BlogArticle, notFoundComponent: BlogNotFound, pendingComponent: BlogSkeleton, errorComponent: BlogError,
});
function BlogArticle() {
  const { post, related } = Route.useLoaderData();
  const faqs = blogFaqs(post);
  const schemas = [{ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: blogDescription(post),
    ...(post.hero_image_url ? { image: post.hero_image_url } : {}), datePublished: post.published_at, dateModified: post.updated_at,
    mainEntityOfPage: `${BUSINESS.domain}/blog/${post.slug}`, publisher: { "@type": "Organization", name: BUSINESS.name, url: BUSINESS.domain },
  }, ...(faqs.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }] : [])];
  return <MarketingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }} />
    <article lang={post.language || "en"} className="mx-auto max-w-[752px] px-4 py-10 md:py-14">
      <Link to="/blog" className="text-sm font-medium text-brand-navy hover:underline">← Back to all articles</Link>
      <header className="mb-8 mt-8"><h1 className="break-words text-3xl leading-tight md:text-4xl">{post.title}</h1><div className="mt-5"><BlogMeta post={post} /></div></header>
      <BlogImage key={post.hero_image_url} src={post.hero_image_url} alt={post.hero_image_alt || post.title} eager className="mb-10 max-h-[400px] rounded-lg" />
      <BlogHtml html={post.content_html || ""} />
      <BlogImage src={post.infographic_url} alt={`Infographic: ${post.title}`} className="mt-10 rounded-lg border border-border object-contain" />
      {faqs.length > 0 && <section className="mt-12 border-t border-border pt-8"><h2 className="text-2xl">Frequently Asked Questions</h2><Accordion type="single" collapsible defaultValue="faq-0" className="mt-5">{faqs.map((faq, i) => <AccordionItem key={i} value={`faq-${i}`}><AccordionTrigger className="gap-4 text-base">{faq.question}</AccordionTrigger><AccordionContent className="text-base leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></section>}
      {related.length > 0 && <section className="mt-12 border-t border-border pt-8"><h2 className="mb-6 text-2xl">Related articles</h2><div className="space-y-4">{related.map(item => <BlogCard key={item.id} post={item} compact />)}</div></section>}
    </article>
  </MarketingLayout>;
}