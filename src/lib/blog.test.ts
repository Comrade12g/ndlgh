import { describe, expect, test } from "bun:test";
import { articlePayload, BLOG_PAGE_SIZE, readingTime } from "./blog";
import { sanitizeArticle } from "./blog-content.server";

describe("Visibly article rules", () => {
  test("listing initially returns twelve articles", () => { expect(BLOG_PAGE_SIZE).toBe(12); });
  test("reading time rounds up at 200 words per minute", () => {
    expect(readingTime(`<p>${Array(200).fill("cargo").join(" ")}</p>`)).toBe(1);
    expect(readingTime(`<p>${Array(201).fill("cargo").join(" ")}</p>`)).toBe(2);
  });
  test("test deliveries do not require an article", () => {
    expect(articlePayload.parse({ event: "test" })).toEqual({ event: "test" });
  });
  test("unpublished deliveries cannot write articles", () => {
    expect(articlePayload.safeParse({ event: "article.draft" }).success).toBe(false);
  });
  test("safe link targets and rel attributes are preserved", () => {
    const html = sanitizeArticle('<a href="https://www.ndlgh.com/quote" target="_blank" rel="nofollow noopener">Quote</a>');
    expect(html).toContain('target="_blank"'); expect(html).toContain('rel="nofollow noopener"');
  });
  test("delivered content cannot execute scripts or event handlers", () => {
    const html = sanitizeArticle('<script>alert(1)</script><img src="https://www.ndlgh.com/photo.webp" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>');
    expect(html).not.toContain("<script"); expect(html).not.toContain("onerror"); expect(html).not.toContain("javascript:");
  });
});