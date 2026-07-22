import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { requestCustomerPasswordReset } from "@/lib/password-reset.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLockup } from "@/components/brand/Logo";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { openWhatsApp } from "@/lib/whatsapp";
import { ArrowLeft, MessageCircle } from "lucide-react";

const SUPPORT_WHATSAPP = "+233500229352";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset your password — NDL Ghana" },
      { name: "description", content: "Reset the password on your NDL Ghana customer account." },
    ],
  }),
});

function ForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const requestReset = useServerFn(requestCustomerPasswordReset);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestReset({ data: { phone } });
      setSubmitted(res.phone);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function contactSupport() {
    const message = submitted
      ? `Hi NDL Ghana, I need to reset the password on my account. My phone number is ${submitted}.`
      : "Hi NDL Ghana, I need to reset the password on my account.";
    openWhatsApp(SUPPORT_WHATSAPP, message);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <LogoLockup />
        </div>
        <Link
          to="/auth"
          search={{ mode: "signin" } as never}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <Card className="p-6">
          <h1 className="font-display text-2xl font-extrabold text-brand-navy">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the phone number on your NDL account. Your account manager will reset your
            password on WhatsApp within one business day.
          </p>

          {!submitted ? (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 …"
                  required
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-brand-orange hover:bg-brand-orange/90"
              >
                {loading ? "Submitting…" : "Continue"}
              </Button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-md border bg-muted/40 p-4 text-sm">
                <div className="font-semibold text-brand-navy">Request received</div>
                <p className="mt-1 text-muted-foreground">
                  Tap the button below to message NDL Ghana on WhatsApp. Include the phone number
                  <span className="font-mono"> {submitted}</span> so we can verify your identity
                  and issue a temporary password.
                </p>
              </div>
              <Button
                onClick={contactSupport}
                className="h-11 w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Continue on WhatsApp
              </Button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Staff members: use "Continue with Google" on the sign-in page.
          </p>
        </Card>
      </div>
    </div>
  );
}
