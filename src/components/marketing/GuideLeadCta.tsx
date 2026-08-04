import { useState } from "react";
import { Mail, Loader2, CheckCircle2, CalendarClock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/guides.functions";
import { cn } from "@/lib/utils";

type Mode = "newsletter" | "consultation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GuideLeadCta({
  sourcePath,
  className,
  defaultMode = "newsletter",
}: {
  sourcePath: string;
  className?: string;
  defaultMode?: Mode;
}) {
  const send = useServerFn(submitLead);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (cleanEmail.length > 255) {
      setError("That email address is too long.");
      return;
    }
    if (mode === "consultation" && fullName.trim().length < 2) {
      setError("Please tell us your name so we know who to call.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await send({
        data: {
          email: cleanEmail,
          fullName: fullName.trim(),
          phone: phone.trim(),
          message: message.trim(),
          leadType: mode,
          sourcePath,
        },
      });
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Something went wrong. Please try again or message us on WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-brand-orange/30 bg-brand-navy p-7 text-white",
          className,
        )}
      >
        <CheckCircle2 className="h-8 w-8 text-brand-orange" />
        <h2 className="mt-3 font-display text-2xl font-bold">
          {mode === "newsletter" ? "You're on the list" : "Request received"}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-white/80">
          {mode === "newsletter"
            ? "We'll email new rate updates, duty changes and shipping guides — no spam, unsubscribe any time."
            : "Our clearing team will reach out shortly to plan your shipment and confirm indicative costs."}
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-brand-orange/30 bg-brand-navy p-7 text-white",
        className,
      )}
      aria-labelledby="guide-lead-heading"
    >
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "newsletter", label: "Get shipping updates", icon: Mail },
            { key: "consultation", label: "Book a free consultation", icon: CalendarClock },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setMode(t.key);
              setError(null);
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition",
              mode === t.key
                ? "bg-brand-orange text-white"
                : "border border-white/25 text-white/80 hover:bg-white/10",
            )}
            aria-pressed={mode === t.key}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <h2 id="guide-lead-heading" className="mt-5 font-display text-2xl font-bold">
        {mode === "newsletter"
          ? "Freight rates and duty changes, in your inbox"
          : "Talk to a clearing specialist — free"}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-white/80">
        {mode === "newsletter"
          ? "Monthly CBM and air rate movements from China, Dubai, Thailand, Canada and the US, plus new GRA duty and Tema Port guidance."
          : "Tell us what you're importing and we'll advise on mode, duty exposure and realistic landed cost before you pay your supplier."}
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          {mode === "consultation" && (
            <div>
              <label htmlFor="lead-name" className="text-xs font-medium text-white/80">
                Full name
              </label>
              <input
                id="lead-name"
                name="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                autoComplete="name"
                className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-brand-orange focus:outline-none"
                placeholder="Ama Mensah"
              />
            </div>
          )}
          <div>
            <label htmlFor="lead-email" className="text-xs font-medium text-white/80">
              Email address
            </label>
            <input
              id="lead-email"
              name="email"
              type="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              autoComplete="email"
              aria-invalid={!!error}
              className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-brand-orange focus:outline-none"
              placeholder="you@company.com"
            />
          </div>
          {mode === "consultation" && (
            <div>
              <label htmlFor="lead-phone" className="text-xs font-medium text-white/80">
                Phone / WhatsApp (optional)
              </label>
              <input
                id="lead-phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={32}
                autoComplete="tel"
                className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-brand-orange focus:outline-none"
                placeholder="0500229352"
              />
            </div>
          )}
        </div>

        {mode === "consultation" && (
          <div>
            <label htmlFor="lead-message" className="text-xs font-medium text-white/80">
              What are you shipping? (optional)
            </label>
            <textarea
              id="lead-message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-brand-orange focus:outline-none"
              placeholder="30 cartons of shoes from Guangzhou, need them in Accra by October."
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-brand-orange">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange/90 disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "newsletter" ? "Subscribe" : "Request a callback"}
          </button>
          <span className="text-xs text-white/65">
            We never share your details. Unsubscribe any time.
          </span>
        </div>
      </form>
    </section>
  );
}
