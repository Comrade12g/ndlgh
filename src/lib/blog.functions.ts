import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { BLOG_PAGE_SIZE, blogSlug } from "@/lib/blog";

function blogPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("Blog connection unavailable");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}
export const listBlogPosts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ offset: z.number().int().min(0).max(100000).default(0) }).parse(input))
  .handler(async ({ data }) => {
    const { data: posts, error, count } = await blogPublicClient().from("blog_posts")
      .select("*", { count: "exact" }).order("published_at", { ascending: false, nullsFirst: false }).order("id", { ascending: false })
      .range(data.offset, data.offset + BLOG_PAGE_SIZE - 1);
    if (error) throw new Error("Couldn't load articles. Please try again.");
    return { posts: posts || [], hasMore: data.offset + (posts?.length || 0) < (count || 0) };
  });
export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: blogSlug }).parse(input))
  .handler(async ({ data }) => {
    const client = blogPublicClient();
    const { data: post, error } = await client.from("blog_posts").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error("Couldn't load article. Please try again.");
    if (!post) return null;
    const { sanitizeArticle } = await import("@/lib/blog-content.server");
    const { data: related, error: relatedError } = await client.from("blog_posts").select("*").neq("id", post.id).order("published_at", { ascending: false }).limit(3);
    if (relatedError) throw new Error("Couldn't load related articles. Please try again.");
    return { post: { ...post, content_html: sanitizeArticle(post.content_html || "") }, related: related || [] };
  });
export const listBlogSitemap = createServerFn({ method: "GET" }).handler(async () => {
  const client = blogPublicClient();
  const entries: { slug: string; updated_at: string | null }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.from("blog_posts").select("slug,updated_at").order("id").range(offset, offset + 999);
    if (error) throw new Error("Blog sitemap unavailable");
    entries.push(...(data || []));
    if ((data?.length || 0) < 1000) break;
  }
  return entries;
});