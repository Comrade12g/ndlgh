import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent } from "@/lib/analytics";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("ndl:cookie-settings", reopen);
    return () => window.removeEventListener("ndl:cookie-settings", reopen);
  }, []);

  if (!open) return null;
  const choose = (v: "granted" | "denied") => {
    setConsent(v);
    setOpen(false);
  };

  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-xl border bg-card p-4 shadow-lg md:p-5">
      <p className="text-sm text-muted-foreground">
        We use cookies for Google Analytics and Microsoft Clarity (visit recordings and heatmaps) to improve our site.
        Sign-in cookies are always on. See our <Link to="/privacy" className="font-semibold text-brand-navy underline">privacy policy</Link>.
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => choose("denied")}>Reject analytics</Button>
        <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90" onClick={() => choose("granted")}>Accept analytics</Button>
      </div>
    </div>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("ndl:cookie-settings"));
}
