import { useEffect, useRef } from "react";

/** 3D tilt on pointer move. */
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 10) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    el.style.transformStyle = "preserve-3d";
    el.style.transition = "transform 240ms cubic-bezier(.2,.7,.2,1)";
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * max;
      const ry = (px - 0.5) * max;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0,0,0)`;
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
      cancelAnimationFrame(raf);
    };
  }, [max]);
  return ref;
}
