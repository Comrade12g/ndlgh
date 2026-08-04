import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { GUIDE_CATEGORIES, mergeGuides, type Guide } from "@/content/guides";
import { listPublishedGuides } from "@/lib/guides.functions";

const BASE_URL = "https://ndlgh.susuboxgh.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const allGuides = mergeGuides((await listPublishedGuides()) as Guide[]);
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/services", changefreq: "monthly", priority: "0.8" },
          { path: "/lanes", changefreq: "monthly", priority: "0.7" },
          ...["china", "dubai", "thailand", "canada", "us"].map(
            (o): SitemapEntry => ({ path: `/lanes/${o}`, changefreq: "monthly", priority: "0.7" }),
          ),
          { path: "/quote", changefreq: "monthly", priority: "0.8" },
          { path: "/tracking", changefreq: "weekly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/guides", changefreq: "weekly", priority: "0.8" },
          ...GUIDE_CATEGORIES.map(
            (c): SitemapEntry => ({
              path: `/guides/category/${c.slug}`,
              changefreq: "weekly",
              priority: "0.6",
            }),
          ),
          ...allGuides.map(
            (g): SitemapEntry => ({
              path: `/guides/${g.slug}`,
              changefreq: "monthly",
              priority: "0.7",
            }),
          ),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
