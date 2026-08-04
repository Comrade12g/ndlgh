import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Guide, GuideCategorySlug, GuideSection } from "@/content/guides";

const CATEGORY_SLUGS: GuideCategorySlug[] = [
  "shipping-costs",
  "customs-duty",
  "how-to-ship",
  "tracking",
];

/** Publishable-key client: public reads only, governed by RLS as `anon`. */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type GuideRow = Database["public"]["Tables"]["guides"]["Row"];

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function asSections(v: unknown): GuideSection[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const o = raw as Record<string, unknown>;
    if (typeof o["h"] !== "string") return [];
    const table = o["table"] as { head?: unknown; rows?: unknown } | undefined;
    const section: GuideSection = { h: o["h"] };
    const p = asStringArray(o["p"]);
    if (p.length) section.p = p;
    const bullets = asStringArray(o["bullets"]);
    if (bullets.length) section.bullets = bullets;
    if (table && Array.isArray(table.head) && Array.isArray(table.rows)) {
      section.table = {
        head: asStringArray(table.head),
        rows: (table.rows as unknown[]).map((r) => asStringArray(r)),
      };
    }
    return [section];
  });
}

function asFaqs(v: unknown): { q: string; a: string }[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const o = raw as Record<string, unknown>;
    return typeof o["q"] === "string" && typeof o["a"] === "string"
      ? [{ q: o["q"], a: o["a"] }]
      : [];
  });
}

export function rowToGuide(row: GuideRow): Guide {
  const category = (CATEGORY_SLUGS as string[]).includes(row.category)
    ? (row.category as GuideCategorySlug)
    : "shipping-costs";
  return {
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title || row.title,
    description: row.description,
    category,
    updated: (row.published_at ?? row.updated_at ?? row.created_at).slice(0, 10),
    readMinutes: row.read_minutes,
    image: row.image || "/gallery/stacked-containers.jpg",
    imageAlt: row.image_alt || row.title,
    intro: asStringArray(row.intro),
    sections: asSections(row.sections),
    faqs: asFaqs(row.faqs),
    keywords: asStringArray(row.keywords),
  };
}

/** All published, CMS-managed guides. Safe for public routes and SSR. */
export const listPublishedGuides = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await publicClient()
      .from("guides")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToGuide);
  } catch (err) {
    console.error("[guides] listPublishedGuides failed", err);
    return [] as Guide[];
  }
});

const leadSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  fullName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  leadType: z.enum(["newsletter", "consultation"]),
  sourcePath: z.string().trim().max(255).optional().or(z.literal("")),
});

/** Public lead capture from the guides CTAs. */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await publicClient()
      .from("leads")
      .insert({
        email: data.email.toLowerCase(),
        full_name: data.fullName || null,
        phone: data.phone || null,
        message: data.message || null,
        lead_type: data.leadType,
        source_path: data.sourcePath || null,
      });
    if (error) {
      console.error("[guides] submitLead failed", error);
      return { ok: false as const, error: "We couldn't save that just now. Please try again." };
    }
    return { ok: true as const };
  });
