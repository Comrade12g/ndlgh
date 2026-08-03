import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { LogoLockup } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/lanes", label: "Lanes" },
  { to: "/quote", label: "Quote" },
  { to: "/tracking", label: "Track" },
  { to: "/guides", label: "Guides" },
  { to: "/about", label: "About" },

  { to: "/contact", label: "Contact" },
] as const;

export const NDL_PHONE = "0500229352";
export const NDL_PHONE_INTL = "+233500229352";
export const NDL_EMAIL = "info@ndlgh.com";
export const NDL_ADDRESS = "Derby Avenue, Ferro Bel Plaza, Accra";

export function MarketingLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center">
            <LogoLockup compact />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-brand-navy" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
            <Link to="/quote">
              <Button size="sm" className="bg-brand-orange text-white hover:bg-brand-orange/90">
                Get a quote
              </Button>
            </Link>
          </div>
          <button
            aria-label="Open menu"
            className="rounded-md p-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t bg-background lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col p-2">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium"
                  activeProps={{ className: "bg-secondary text-brand-navy" }}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2 p-2">
                <Link to="/auth" className="flex-1" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link to="/quote" className="flex-1" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-brand-orange text-white hover:bg-brand-orange/90">
                    Get a quote
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t bg-brand-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
          <div>
            <LogoLockup compact />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              End-to-end logistics from China, Dubai, Thailand, Canada and the US to your door in Ghana.
            </p>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-orange">
              Company
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/lanes">Lanes</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-orange">
              Tools
            </div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/quote">Freight quote</Link></li>
              <li><Link to="/tracking">Track a shipment</Link></li>
              <li><Link to="/auth">Sign in</Link></li>
              <li><Link to="/portal">Customer portal</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-orange">
              Contact
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                {NDL_ADDRESS}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand-orange" />
                <a href={`tel:${NDL_PHONE}`}>{NDL_PHONE}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand-orange" />
                <a href={`mailto:${NDL_EMAIL}`}>{NDL_EMAIL}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/85 md:flex-row">
            <div>© {new Date().getFullYear()} NDL Cargo Ghana. All rights reserved.</div>
            <div>Reliable global freight · Accra, Ghana</div>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}

export function FloatingWhatsApp({ className }: { className?: string }) {
  const [showTip, setShowTip] = useState(true);
  return (
    <div className={cn("fixed bottom-5 right-5 z-50 flex items-center gap-2", className)}>
      {showTip && (
        <div className="hidden animate-fade-in items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-brand-navy shadow-lg ring-1 ring-black/5 sm:flex">
          <span>Chat with us on WhatsApp</span>
          <button aria-label="Dismiss" onClick={() => setShowTip(false)} className="text-muted-foreground hover:text-brand-navy">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          openWhatsApp(
            NDL_PHONE_INTL,
            "Hello NDL Cargo, I'd like to get a quote / ask about shipping to Ghana.",
          )
        }
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 ring-4 ring-[#25D366]/20 transition-transform hover:scale-110 active:scale-95 animate-wa-nudge"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#25D366]/30" />
      </button>
    </div>
  );
}
