import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LQIP } from "@/assets/gallery/lqip";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: string; // e.g. "aspect-square" or "aspect-[4/3]"
  eager?: boolean;
  prefetch?: boolean; // when true, start loading before scroll (uses fetchpriority high)
  width?: number;
  height?: number;
  /** Layout hint for responsive srcset selection. */
  sizes?: string;
};

/** Local gallery photos ship in 1600w + 800w variants. */
function responsive(src: string) {
  if (!src.startsWith("/gallery/") || src.includes("-800.jpg")) return undefined;
  return `${src.replace(/\.jpg$/, "-800.jpg")} 800w, ${src} 1600w`;
}

/**
 * SmartImage — instant LQIP preview + smart lazy-loading.
 * - Inline blurred base64 preview paints immediately (no network round-trip).
 * - Responsive `srcset` serves an 800w file to small viewports.
 * - Fades in when loaded, degrades gracefully on error.
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  aspect,
  eager = false,
  prefetch = false,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);
  const lqip = LQIP[src] ?? LQIP[src.replace("-800.jpg", ".jpg")];
  const srcSet = responsive(src);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  // If the browser already had it cached, the onLoad may have fired pre-hydration.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-secondary/60", aspect, className)}>
      {lqip && !errored && (
        <img
          src={lqip}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-500",
            loaded ? "opacity-0" : "opacity-100",
          )}
        />
      )}
      {!loaded && !errored && !lqip && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-muted to-secondary" />
      )}
      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/60 text-xs text-muted-foreground">
          Image unavailable
        </div>
      ) : (
        <img
          ref={ref}
          src={src}
          {...(srcSet ? { srcSet, sizes } : {})}
          alt={alt}
          {...(eager ? {} : { loading: "lazy" as const })}
          decoding="async"
          {...(prefetch ? { fetchPriority: "high" as const } : {})}
          {...(width ? { width } : {})}
          {...(height ? { height } : {})}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "relative h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}

/**
 * Prefetch a set of image URLs by injecting <link rel="preload"> tags.
 * Useful for the next few hero carousel slides.
 */
export function prefetchImages(urls: string[]) {
  if (typeof document === "undefined") return;
  for (const url of urls) {
    if (document.head.querySelector(`link[data-prefetch-img="${url}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    link.setAttribute("data-prefetch-img", url);
    document.head.appendChild(link);
  }
}
