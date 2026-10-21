// Google Analytics (gtag.js) — client-only, initialized once at app startup.
const measurementId =
  (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined) ||
  "G-J7697QE6M3";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || initialized || !measurementId) return;
  initialized = true;

  // Load gtag.js only after the page has painted, so it doesn't delay LCP.
  const load = () => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Microsoft Clarity (session recordings & heatmaps)
    const w = window as unknown as { clarity?: ((...a: unknown[]) => void) & { q?: unknown[] } };
    if (!w.clarity) {
      const c = function (...args: unknown[]) {
        (c.q = c.q || []).push(args);
      } as ((...a: unknown[]) => void) & { q?: unknown[] };
      w.clarity = c;
      const cs = document.createElement("script");
      cs.async = true;
      cs.src = "https://www.clarity.ms/tag/z1a4x7t7wy";
      document.head.appendChild(cs);
    }
  };
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (ric) ric(load, { timeout: 4000 });
  else setTimeout(load, 2500);

  window.dataLayer = window.dataLayer || [];
  // gtag.js requires the Arguments object, not a plain array.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || !window.gtag || !measurementId) return;
  window.gtag("event", "page_view", { page_path: path });
}
