import { BUSINESS } from "@/config/business";
import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** Brand marks drawn as inline SVG so every platform renders identically. */
const ICONS = {
  whatsapp: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.55-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.55 3.7-8.24 8.25-8.24Zm4.52 10.29c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.06 0 1.22.89 2.39 1 2.56.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.18 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  ),
  tiktok: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v12.9a2.6 2.6 0 0 1-2.6 2.5 2.6 2.6 0 0 1 0-5.2c.27 0 .53.04.77.12v-3.3a5.9 5.9 0 0 0-.77-.05 5.9 5.9 0 1 0 5.9 5.9V9.4a7.5 7.5 0 0 0 4.3 1.37V7.57a4.3 4.3 0 0 1-3.34-1.75Z" />
    </svg>
  ),
  instagram: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 1.98c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.41-.55.21-.94.47-1.36.88-.41.42-.67.81-.88 1.36-.17.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.41 2.19.21.55.47.94.88 1.36.42.41.81.67 1.36.88.42.17 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.41.55-.21.94-.47 1.36-.88.41-.42.67-.81.88-1.36.17-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.41-2.19a3.66 3.66 0 0 0-.88-1.36 3.66 3.66 0 0 0-1.36-.88c-.42-.17-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07Zm0 3.38a4.44 4.44 0 1 1 0 8.88 4.44 4.44 0 0 1 0-8.88Zm0 7.32a2.88 2.88 0 1 0 0-5.76 2.88 2.88 0 0 0 0 5.76Zm5.65-7.5a1.04 1.04 0 1 1-2.08 0 1.04 1.04 0 0 1 2.08 0Z" />
    </svg>
  ),
  facebook: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={props.className}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  ),
} as const;

export const SOCIALS = [
  {
    key: "whatsapp",
    label: "WhatsApp Channel",
    handle: "Join the channel",
    href: BUSINESS.socials.whatsappChannel,
    icon: ICONS.whatsapp,
    note: "Container loading dates and offers first",
  },
  {
    key: "tiktok",
    label: "TikTok",
    handle: "@ndlcargogh",
    href: BUSINESS.socials.tiktok,
    icon: ICONS.tiktok,
    note: "Cargo videos and warehouse tours",
  },
  {
    key: "instagram",
    label: "Instagram",
    handle: "@ndl_gh",
    href: BUSINESS.socials.instagram,
    icon: ICONS.instagram,
    note: "Arrivals, tips and daily updates",
  },
  {
    key: "facebook",
    label: "Facebook",
    handle: "NDL Cargo Ghana",
    href: BUSINESS.socials.facebook,
    icon: ICONS.facebook,
    note: "News, promotions and reviews",
  },
] as const;

/** Icon-only row, used in the footer. */
export function SocialIconRow({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {SOCIALS.map((s) => (
        <li key={s.key}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={`NDL Cargo Ghana on ${s.label}`}
            title={s.label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange",
              tone === "dark"
                ? "bg-white/10 text-white hover:bg-brand-orange"
                : "bg-secondary text-brand-navy hover:bg-brand-orange hover:text-white",
            )}
          >
            <s.icon className="h-5 w-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Named cards with handles, used on contact/about pages. */
export function SocialCards({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {SOCIALS.map((s) => (
        <li key={s.key}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer me"
            className="flex h-full items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-brand-orange/60 hover:bg-brand-orange/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-brand-navy">{s.label}</span>
              <span className="block truncate text-sm text-brand-sky">{s.handle}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{s.note}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
