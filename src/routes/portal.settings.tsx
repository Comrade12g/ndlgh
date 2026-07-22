import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updateCustomerPhone, changeMyPassword } from "@/lib/customer-account.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLockup } from "@/components/brand/Logo";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

// Not under /_authenticated because that layout is staff-only.
export const Route = createFileRoute("/portal/settings" as never)({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const updatePhone = useServerFn(updateCustomerPhone);
  const changePassword = useServerFn(changeMyPassword);

  const { data: profile } = useQuery({
    queryKey: ["settings-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, shipping_mark")
        .eq("id", u.user.id)
        .maybeSingle();
      return { email: u.user.email ?? "", ...data };
    },
  });

  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    setSavingPhone(true);
    try {
      const res = await updatePhone({ data: { phone } });
      toast.success(`Phone updated to ${res.phone}. Use this number to sign in from now on.`);
      setPhone("");
      qc.invalidateQueries({ queryKey: ["settings-profile"] });
      qc.invalidateQueries({ queryKey: ["portal-profile"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPhone(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({ data: { currentPassword, newPassword } });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/portal">
            <LogoLockup compact />
          </Link>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/portal" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to portal
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-navy">Account settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the phone number and password you use to sign in.
          </p>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-brand-navy">Profile</h2>
            <p className="text-sm text-muted-foreground">Read-only details on your account.</p>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{profile?.full_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Shipping mark</dt>
              <dd className="font-mono font-medium text-brand-orange">
                {profile?.shipping_mark ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Current phone</dt>
              <dd className="font-medium">{profile?.phone ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <form onSubmit={submitPhone} className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-navy">Change phone number</h2>
              <p className="text-sm text-muted-foreground">
                Your new number becomes your sign-in identifier immediately.
              </p>
            </div>
            <div>
              <Label htmlFor="new-phone">New phone number</Label>
              <Input
                id="new-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 …"
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={savingPhone}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              {savingPhone ? "Saving…" : "Update phone"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <form onSubmit={submitPassword} className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-navy">Change password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your current password to set a new one.
              </p>
            </div>
            <div>
              <Label htmlFor="cur-pw">Current password</Label>
              <Input
                id="cur-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="new-pw">New password</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="cf-pw">Confirm new password</Label>
              <Input
                id="cf-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={savingPw}
              className="bg-brand-navy hover:bg-brand-navy/90"
            >
              {savingPw ? "Saving…" : "Update password"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
