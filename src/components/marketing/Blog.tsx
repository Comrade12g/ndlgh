import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { BookOpen, ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { blogDate, blogDescription, type BlogPost } from "@/lib/blog";

export function BlogImage({ src, alt, className = "", eager = false }: { src: string | null; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img src={src} alt={alt} width={1200} height={675} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} className={`w-full object-cover ${className}`} />;
}
export function BlogMeta({ post }: { post: BlogPost }) {
  return <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
    {post.published_at && <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /><time dateTime={post.published_at}>{blogDate(post.published_at)}</time></span>}
    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.reading_time || 1} min read</span>
  </div>;
}
export function BlogCard({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  return <Link to="/blog/$slug" params={{ slug: post.slug }} className={`group overflow-hidden rounded-lg border border-border bg-card transition duration-200 hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none ${compact ? "flex items-start" : "flex flex-col"}`}>
    <BlogImage src={post.hero_image_url} alt={post.hero_image_alt || post.title} className={compact ? "aspect-square max-w-24 shrink-0" : "aspect-video"} />
    <div className={compact ? "min-w-0 p-3" : "flex flex-1 flex-col p-6"}>
      {!compact && <BlogMeta post={post} />}
      <h2 className={`${compact ? "text-sm" : "mt-4 text-xl"} break-words leading-snug text-foreground`}>{post.title}</h2>
      {compact ? <p className="mt-2 text-xs text-muted-foreground">{blogDate(post.published_at)}</p> : <><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{blogDescription(post)}</p><span className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand-navy">Read article <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></>}
    </div>
  </Link>;
}
export function BlogSkeleton() {
  return <MarketingLayout><section className="mx-auto max-w-7xl px-4 py-16" aria-label="Loading articles" aria-busy="true"><div className="mb-10 h-10 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="overflow-hidden rounded-lg border border-border"><div className="aspect-video animate-pulse bg-muted motion-reduce:animate-none" /><div className="space-y-4 p-6"><div className="h-5 animate-pulse bg-muted motion-reduce:animate-none" /><div className="h-16 animate-pulse bg-muted motion-reduce:animate-none" /></div></div>)}</div></section></MarketingLayout>;
}
export function BlogEmpty() {
  return <div className="flex min-h-72 flex-col items-center justify-center border-y border-border py-12 text-center"><div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-brand-navy"><BookOpen className="h-10 w-10" strokeWidth={1.25} /></div><h2 className="text-xl">Articles are on the way!</h2><p className="mt-2 text-muted-foreground">Check back soon.</p></div>;
}
export function BlogError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return <MarketingLayout><section className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl">Couldn't load articles. Please try again.</h1><Button variant="outline" className="mt-6 cursor-pointer" onClick={() => { void router.invalidate().then(reset); }}>Retry</Button></section></MarketingLayout>;
}
export function BlogNotFound() {
  return <MarketingLayout><section className="mx-auto max-w-3xl px-4 py-24 text-center"><p className="text-sm font-semibold text-muted-foreground">404</p><h1 className="mt-3 text-3xl">Article not found</h1><Link to="/blog" className="mt-6 inline-block"><Button variant="outline" className="cursor-pointer">Back to all articles</Button></Link></section></MarketingLayout>;
}
export function BlogHtml({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll("table").forEach(table => {
      if (table.parentElement?.classList.contains("blog-table-scroll")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "blog-table-scroll";
      table.before(wrapper);
      wrapper.append(table);
    });
    const images = Array.from(root.querySelectorAll("img"));
    const hide = (event: Event) => { if (event.target instanceof HTMLImageElement) event.target.hidden = true; };
    images.forEach(img => { img.addEventListener("error", hide); if (img.complete && !img.naturalWidth) img.hidden = true; });
    return () => images.forEach(img => img.removeEventListener("error", hide));
  }, [html]);
  return <div ref={ref} className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}