import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { articlePayload, readingTime } from "@/lib/blog";
import { BUSINESS } from "@/config/business";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Cache-Control": "no-store" };
export const Route = createFileRoute("/api/public/receive-article")({
  server: { handlers: {
    OPTIONS: () => new Response(null, { status: 204, headers: cors }),
    POST: async ({ request }) => {
      const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
      const expected = process.env["VISIBLY_WEBHOOK_TOKEN"];
      const token = request.headers.get("Authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
      if (!expected || !token) return reply({ error: "Unauthorized" }, 401);
      const encoder = new TextEncoder();
      const [a, b] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(token)), crypto.subtle.digest("SHA-256", encoder.encode(expected))]);
      const aa = new Uint8Array(a), bb = new Uint8Array(b);
      let diff = 0;
      for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
      if (diff !== 0) return reply({ error: "Unauthorized" }, 401);
      try {
        if (Number(request.headers.get("content-length") || 0) > 4000000) return reply({ error: "Article too large" }, 413);
        const raw = await request.text();
        if (raw.length > 4000000) return reply({ error: "Article too large" }, 413);
        const parsed = articlePayload.safeParse(JSON.parse(raw));
        if (!parsed.success) return reply({ error: "Invalid article payload" }, 400);
        const p = parsed.data;
        if (p.event === "test") return reply({ url: `${BUSINESS.domain}/blog/test`, status: "ok" });
        const { sanitizeArticle } = await import("@/lib/blog-content.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("blog_posts").upsert({
          id: p.id, title: p.title, slug: p.slug, content_html: sanitizeArticle(p.content_html), content_markdown: p.content_markdown ?? null,
          hero_image_url: p.heroImageUrl ?? null, hero_image_alt: p.heroImageAlt ?? null, infographic_url: p.infographicImageUrl ?? null,
          meta_description: p.metaDescription ?? null, meta_keywords: p.metaKeywords ?? p.keywords?.join(", ") ?? null,
          tags: p.wordpressTags ?? null, faq_schema: p.faqSchema ?? null, language: p.languageCode,
          reading_time: readingTime(p.content_html), published_at: p.publishedAt, updated_at: p.updatedAt, created_at: p.createdAt, received_at: new Date().toISOString(),
        }, { onConflict: "id" });
        if (error) return reply({ error: "Unable to save article; please retry" }, 500);
        return reply({ url: `${BUSINESS.domain}/blog/${p.slug}` });
      } catch { return reply({ error: "Unable to process article; please retry" }, 500); }
    },
  } },
});