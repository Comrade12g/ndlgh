import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: string; // e.g. "aspect-square" or "aspect-[4/3]"
  eager?: boolean;
  prefetch?: boolean; // when true, start loading before scroll (uses fetchpriority high)
};

/**
 * SmartImage — skeleton placeholder + smart lazy-loading.
 * - Uses `loading="lazy"` and `decoding="async"` by default.
 * - Fades in when loaded.
 * - Falls back gracefully on error to a neutral tile.
 * - `prefetch` enables `fetchpriority="high"` for LCP-critical images.
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  aspect,
  eager = false,
  prefetch = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-secondary/60", aspect, className)}>
      {!loaded && !errored && (
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
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          {...(prefetch ? { fetchPriority: "high" as const } : {})}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
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
