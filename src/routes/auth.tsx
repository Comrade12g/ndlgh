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
import { openWhatsApp } from "@/lib/whatsapp";
import {
  friendlySignInError,
  SUPPORT_WHATSAPP_NUMBER,
  SUPPORT_WHATSAPP_MESSAGE,
} from "@/lib/auth-errors";
import { toE164Gh, phoneToSyntheticEmail } from "@/lib/phone";
import { AlertCircle, ArrowLeft, MessageCircle } from "lucide-react";

// NDL Ghana's customer-facing WhatsApp business number
const SIGNUP_WHATSAPP_NUMBER = "+233500229352";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { mode: "signin" | "signup" } => ({
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  component: AuthPage,
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

async function routeAfterSignIn(navigate: ReturnType<typeof useNavigate>) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
  const isStaff = (roles ?? []).some((r) => STAFF_ROLES.includes(r.role));
  navigate({ to: isStaff ? "/dashboard" : "/portal" });
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInError, setSignInError] = useState<
    { title: string; description: string; showHelp: boolean } | null
  >(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) routeAfterSignIn(navigate);
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSignInError(null);
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
      setSignInError(friendlySignInError(err));
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

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden overflow-hidden bg-brand-navy p-10 text-white md:flex md:flex-col md:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-brand-sky/25 blur-3xl" />
        <Link
          to="/"
          className="relative z-10 inline-flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            The world to your <span className="text-brand-orange">doorstep</span>.
          </h2>
          <p className="mt-4 text-white/80">
            Your account manager sets you up with a shipping mark and login — message us on WhatsApp
            to get started.
          </p>
        </div>
        <div className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} NDL Ghana
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <LogoLockup />
          </div>

          {mode === "signup" ? (
            <SignupWhatsAppCta />
          ) : (
            <>
              <h1 className="font-display text-2xl font-extrabold text-brand-navy">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Customers: sign in with your phone number. Staff: sign in with your work email.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-6 h-11 w-full"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                  />
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
                  <Label htmlFor="identifier">Phone number (customers) or email (staff)</Label>
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
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-brand-navy hover:text-brand-orange"
                  >
                    Forgot password?
                  </Link>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                New customer?{" "}
                <Link
                  to="/auth"
                  search={{ mode: "signup" } as never}
                  className="font-semibold text-brand-orange hover:underline"
                >
                  Get started on WhatsApp
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SignupWhatsAppCta() {
  const message =
    "Hi NDL Ghana! I'd like to sign up for your shipping service. Please set up my account.";
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-brand-navy">Let's get you set up</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We onboard every new customer personally — message us on WhatsApp and your account manager
        will set up your shipping mark and login within one business day.
      </p>
      <Button
        className="mt-6 h-12 w-full bg-emerald-600 hover:bg-emerald-700"
        onClick={() => openWhatsApp(SIGNUP_WHATSAPP_NUMBER, message)}
      >
        <MessageCircle className="mr-2 h-5 w-5" /> Message us on WhatsApp
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have a login?{" "}
        <Link
          to="/auth"
          search={{ mode: "signin" } as never}
          className="font-semibold text-brand-orange hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
