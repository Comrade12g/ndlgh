import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LogoLockup } from "@/components/brand/Logo";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { toE164Gh, phoneToSyntheticEmail } from "@/lib/phone";
import { openWhatsApp } from "@/lib/whatsapp";
import {
  friendlySignInError,
  SUPPORT_WHATSAPP_NUMBER,
  SUPPORT_WHATSAPP_MESSAGE,
} from "@/lib/auth-errors";
import { Ship, Plane, MessageCircle, PackageSearch, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: LoginHome,
});

const STAFF_ROLES = [
  "admin",
  "ops_warehouse",
  "sales_accountant",
  "sourcing_agent",
  "driver",
  "sales",
  "accountant",
  "customer_service",
];

const SIGNUP_WHATSAPP_NUMBER = "+233500229352";

async function routeAfterSignIn(navigate: ReturnType<typeof useNavigate>) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", u.user.id);
  const isStaff = (roles ?? []).some((r) => STAFF_ROLES.includes(r.role));
  navigate({ to: isStaff ? "/dashboard" : "/portal" });
}

function LoginHome() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) routeAfterSignIn(navigate);
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      if (isEmail) {
        const { error } = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password,
        });
        if (error) throw error;
      } else {
        const e164 = toE164Gh(identifier);
        if (!e164) throw new Error("Enter a valid phone number");
        const { error } = await supabase.auth.signInWithPassword({
          email: phoneToSyntheticEmail(e164),
          password,
        });
        if (error) throw error;
      }
      toast.success("Welcome back.");
      await routeAfterSignIn(navigate);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) await routeAfterSignIn(navigate);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLoading(false);
    }
  }

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const code = tracking.trim();
    if (!code) return;
    navigate({ to: "/track/$code", params: { code } });
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* ============ Left: Aesthetic graphics ============ */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0A2E5C] via-[#0F3A73] to-[#1E7FD1] p-10 text-white md:flex md:flex-col md:justify-between [contain:strict]">
        {/* soft blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-orange/25 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-brand-sky/30 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />

        {/* route arcs */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
          viewBox="0 0 600 800"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="arc-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F7941D" />
              <stop offset="100%" stopColor="#2E86DE" />
            </linearGradient>
          </defs>
          <path
            d="M40,120 C200,40 420,80 560,260"
            stroke="url(#arc-g)"
            strokeWidth="2"
            className="animate-dash"
          />
          <path
            d="M20,320 C220,240 420,360 580,460"
            stroke="url(#arc-g)"
            strokeWidth="2"
            className="animate-dash"
            style={{ animationDelay: "-2s" }}
          />
          <path
            d="M60,640 C220,560 400,700 560,660"
            stroke="url(#arc-g)"
            strokeWidth="2"
            className="animate-dash"
            style={{ animationDelay: "-4s" }}
          />
          {/* hub dots */}
          <circle cx="40" cy="120" r="5" fill="#F7941D" />
          <circle cx="20" cy="320" r="5" fill="#F7941D" />
          <circle cx="60" cy="640" r="5" fill="#F7941D" />
          <circle cx="560" cy="260" r="6" fill="#fff" />
          <circle cx="580" cy="460" r="6" fill="#fff" />
          <circle cx="560" cy="660" r="6" fill="#fff" />
        </svg>

        {/* moving ship & plane */}
        <div className="pointer-events-none absolute inset-x-0 top-1/3 animate-sail-right">
          <Ship className="h-10 w-10 text-white/85 drop-shadow-lg animate-bob" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-16 animate-fly">
          <Plane className="h-8 w-8 -rotate-6 text-brand-orange drop-shadow" />
        </div>

        {/* animated waves */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-[200%] animate-waves"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,60 C150,20 300,100 450,60 C600,20 750,100 900,60 C1050,20 1200,80 1200,60 L1200,100 L0,100 Z"
            fill="rgba(255,255,255,0.10)"
          />
          <path
            d="M0,70 C150,40 300,100 450,70 C600,40 750,100 900,70 C1050,40 1200,90 1200,70 L1200,100 L0,100 Z"
            fill="rgba(255,255,255,0.15)"
          />
        </svg>

        {/* content */}
        <div className="relative z-10 inline-flex text-white">
          <LogoLockup />
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
            The world to your <span className="text-brand-orange">doorstep</span>.
          </h1>
          <p className="mt-4 text-white/85">
            Groupage & full-container shipping from China, UK and Dubai — delivered to your door in
            Ghana, tracked every mile.
          </p>

          <form onSubmit={handleTrack} className="mt-6 flex max-w-sm gap-2">
            <div className="relative flex-1">
              <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Track NDL-CN-00123"
                className="h-11 border-white/30 bg-white/10 pl-9 text-white placeholder:text-white/60"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-11">
              Track
            </Button>
          </form>
        </div>

        <div className="relative z-10 text-xs text-white/70">
          © {new Date().getFullYear()} NDL Ghana — Global Shipping: China · UK · Dubai
        </div>
      </div>

      {/* ============ Right: Login ============ */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <LogoLockup />
          </div>

          <h2 className="font-display text-2xl font-extrabold text-brand-navy">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers sign in with your phone. Staff sign in with your work email.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-6 h-11 w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continue with Google (staff)
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="identifier">Phone (customers) or email (staff)</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+233 … or name@company.com"
                required
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full bg-brand-orange hover:bg-brand-orange/90"
              disabled={loading}
            >
              {loading ? "Please wait…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium text-brand-navy">New customer?</p>
            <p className="mt-1 text-muted-foreground">
              We onboard everyone personally. Message us on WhatsApp and your account manager sets
              up your shipping mark and login within a business day.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-10 w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={() =>
                openWhatsApp(
                  SIGNUP_WHATSAPP_NUMBER,
                  "Hi NDL Ghana! I'd like to sign up for your shipping service.",
                )
              }
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Get started on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
