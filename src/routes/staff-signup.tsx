import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLockup } from "@/components/brand/Logo";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/staff-signup")({
  ssr: false,
  component: StaffSignupPage,
});

function StaffSignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone, account_type: "staff" },
        },
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 font-display text-xl font-extrabold text-brand-navy">
            Account created
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Let your admin know you've signed up — they'll assign your role in Admin → Users &amp;
            roles. Once that's done, sign in and you'll land straight in the staff dashboard.
          </p>
          <Button
            className="mt-6 h-11 w-full bg-brand-orange hover:bg-brand-orange/90"
            onClick={() => navigate({ to: "/auth", search: { mode: "signin" } })}
          >
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <LogoLockup />
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Home
          </Link>
        </div>

        <h1 className="font-display text-xl font-extrabold text-brand-navy">
          Create your staff account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          For NDL Ghana team members only. Once you sign up, an admin will assign your role before
          you can access the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+233 …"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
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
            {loading ? "Creating account…" : "Create staff account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/auth"
            search={{ mode: "signin" } as never}
            className="font-semibold text-brand-orange hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
