import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export const BLOG_PAGE_SIZE = 12;
export const blogSlug = z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalText = z.string().max(5000).nullish();
const imageUrl = z.string().url().max(2048).refine(v => v.startsWith("https://"), "HTTPS required").nullish();
const timestamp = z.string().datetime({ offset: true });
export const articlePayload = z.discriminatedUnion("event", [
  z.object({ event: z.literal("test") }),
  z.object({
    event: z.literal("article.published"), id: z.number().int().positive().max(2147483647),
    title: z.string().trim().min(1).max(500), slug: blogSlug,
    content_html: z.string().min(1).max(1500000), content_markdown: z.string().max(1500000).nullish(),
    metaDescription: optionalText, heroImageUrl: imageUrl, heroImageAlt: optionalText,
    infographicImageUrl: imageUrl, keywords: z.array(z.string().max(200)).max(100).optional(),
    metaKeywords: optionalText, wordpressTags: optionalText,
    faqSchema: z.array(z.object({ question: z.string().min(1).max(1000), answer: z.string().min(1).max(10000) })).max(100).nullish(),
    languageCode: z.string().min(2).max(16).regex(/^[a-zA-Z-]+$/).default("en"),
    sourceArticleId: z.number().int().positive().nullish(), status: z.literal("published"),
    publishedAt: timestamp, updatedAt: timestamp, createdAt: timestamp,
  }),
]);
export function plainText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
export function readingTime(html: string) {
  const text = plainText(html);
  return Math.ceil((text ? text.split(/\s+/).length : 0) / 200);
}
export function blogDescription(post: BlogPost) { return (post.meta_description || plainText(post.content_html || "")).slice(0, 160); }
export function blogDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : "";
}
export function blogFaqs(post: BlogPost): { question: string; answer: string }[] {
  const parsed = z.array(z.object({ question: z.string(), answer: z.string() })).safeParse(post.faq_schema);
  return parsed.success ? parsed.data : [];
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
export function xmlEscape(value: string) { return value.replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char] || char); }