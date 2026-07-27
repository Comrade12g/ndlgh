import { useEffect, useRef } from "react";

/** Magnetic hover: element translates slightly toward pointer while hovered. */
export function useMagnetic<T extends HTMLElement = HTMLDivElement>(strength = 0.25) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "translate3d(0,0,0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
      cancelAnimationFrame(raf);
    };
  }, [strength]);
  return ref;
}
