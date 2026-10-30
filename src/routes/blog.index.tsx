import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { BlogCard, BlogEmpty, BlogError, BlogSkeleton } from "@/components/marketing/Blog";
import { Button } from "@/components/ui/button";
import { listBlogPosts } from "@/lib/blog.functions";
import { BUSINESS } from "@/config/business";

const title = `Blog | ${BUSINESS.name}`;
const description = "Read our latest articles and insights";
export const Route = createFileRoute("/blog/")({
  loader: () => listBlogPosts({ data: { offset: 0 } }),
  head: () => ({ meta: [
    { title }, { name: "description", content: description }, { property: "og:title", content: title },
    { property: "og:description", content: description }, { property: "og:type", content: "website" },
    { property: "og:url", content: `${BUSINESS.domain}/blog` }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: `${BUSINESS.domain}/blog` }] }),
  component: BlogIndex, pendingComponent: BlogSkeleton, errorComponent: BlogError,
});
function BlogIndex() {
  const initial = Route.useLoaderData();
  return <BlogListing key={initial.posts.map(p => p.id).join(",")} initial={initial} />;
}
function BlogListing({ initial }: { initial: Awaited<ReturnType<typeof listBlogPosts>> }) {
  const [posts, setPosts] = useState(initial.posts);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const load = useServerFn(listBlogPosts);
  async function loadMore() {
    if (loading) return;
    setLoading(true); setFailed(false);
    try {
      const next = await load({ data: { offset: posts.length } });
      setPosts(previous => [...previous, ...next.posts.filter(post => !previous.some(p => p.id === post.id))]);
      setHasMore(next.hasMore);
    } catch { setFailed(true); } finally { setLoading(false); }
  }
  return <MarketingLayout>
    <section className="border-b border-border bg-secondary/40"><div className="mx-auto max-w-7xl px-4 py-12 md:py-16"><p className="text-sm font-semibold text-brand-navy">NDL Cargo Ghana</p><h1 className="mt-3 text-4xl md:text-5xl">Blog</h1><p className="mt-4 max-w-xl text-muted-foreground">Our latest articles and insights.</p></div></section>
    <section className="mx-auto max-w-7xl px-4 py-12">
      {posts.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map(post => <BlogCard key={post.id} post={post} />)}</div> : <BlogEmpty />}
      {loading && <div aria-label="Loading more articles" className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="h-48 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}</div>}
      {failed && <p role="alert" className="mt-8 text-center text-muted-foreground">Couldn't load articles. Please try again.</p>}
      {hasMore && <div className="mt-10 text-center"><Button variant="outline" disabled={loading} onClick={() => void loadMore()} className="cursor-pointer">{loading ? "Loading…" : failed ? "Retry" : "Load More"}</Button></div>}
    </section>
  </MarketingLayout>;
}