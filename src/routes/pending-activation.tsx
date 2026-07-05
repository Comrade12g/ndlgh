import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoLockup } from "@/components/brand/Logo";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/pending-activation")({
  ssr: false,
  component: PendingActivationPage,
});

function PendingActivationPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth", search: { mode: "signin" } });
    });
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" } });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <LogoLockup />
        </div>
        <Clock className="mx-auto h-12 w-12 text-brand-orange" />
        <h1 className="mt-4 font-display text-xl font-extrabold text-brand-navy">
          Waiting for access
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is created, but no role has been assigned yet. Ask your admin to assign your
          role in Admin → Users &amp; roles — once that's done, sign in again and you'll go straight
          to the dashboard.
        </p>
        <Button variant="outline" className="mt-6 w-full" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
