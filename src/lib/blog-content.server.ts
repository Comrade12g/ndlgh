import sanitizeHtml from "sanitize-html";

/** Keep article formatting and link targets, but never execute supplied scripts. */
export function sanitizeArticle(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "figure", "figcaption"],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, a: ["href", "name", "target", "rel", "title"], img: ["src", "alt", "width", "height", "loading"], "*": ["id", "class", "lang"] },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: { img: (_, attrs) => ({ tagName: "img", attribs: { ...attrs, loading: "lazy" } }), h1: "h2" },
  });
}