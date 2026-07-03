import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-2xl font-extrabold text-brand-navy md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/60 p-10 text-center">
      <div className="font-display text-lg font-bold text-brand-navy">{title}</div>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

const TONE: Record<string, string> = {
  neutral: "bg-muted text-foreground/70 border-border",
  orange: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  navy: "bg-brand-navy/10 text-brand-navy border-brand-navy/20",
  sky: "bg-brand-sky/10 text-brand-sky border-brand-sky/20",
  green: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  red: "bg-red-500/10 text-red-700 border-red-500/20",
  amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
};

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof TONE;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof TONE {
  const s = status.toLowerCase();
  if (["delivered", "cleared", "closed", "paid", "received", "active"].includes(s)) return "green";
  if (
    [
      "in_transit",
      "loading",
      "departed",
      "sent",
      "partial",
      "out_for_delivery",
      "ordered",
      "shipped",
    ].includes(s)
  )
    return "sky";
  if (["planning", "expected", "draft", "requested", "quoted", "scheduled", "new"].includes(s))
    return "amber";
  if (["cancelled", "failed", "returned", "lost", "void", "overdue", "blocked"].includes(s))
    return "red";
  if (["vip", "arrived", "arrived_gh", "ready_delivery"].includes(s)) return "orange";
  return "neutral";
}
