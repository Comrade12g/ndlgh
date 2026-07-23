import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { changeMyPassword } from "@/lib/customer-account.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LogoLockup } from "@/components/brand/Logo";
import { KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/change-password")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
    const { data: prof } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", data.user.id)
      .maybeSingle();
    // If the flag has already been cleared, don't trap them here.
    if (!prof?.must_change_password) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const isStaff = (roles ?? []).some((r) => r.role !== "customer");
      throw redirect({ to: isStaff ? "/dashboard" : "/portal" });
    }
    return { user: data.user };
  },
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const changePassword = useServerFn(changeMyPassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanCurrentPassword = currentPassword.trim();
    const cleanNewPassword = newPassword.trim();
    const cleanConfirmPassword = confirmPassword.trim();
    if (cleanNewPassword !== cleanConfirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (cleanNewPassword === cleanCurrentPassword) {
      toast.error("Choose a new password different from the temporary one");
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        data: { currentPassword: cleanCurrentPassword, newPassword: cleanNewPassword },
      });
      toast.success("Password updated. Welcome to NDL.");
      const { data } = await supabase.auth.getUser();
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user?.id ?? "");
      const isStaff = (roles ?? []).some((r) => r.role !== "customer");
      navigate({ to: isStaff ? "/dashboard" : "/portal", replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <LogoLockup compact />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-10">
        <Card className="p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-brand-navy">
                Set your password
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                You're using a temporary password. Choose a new one to continue.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="cur">Temporary password</Label>
              <PasswordInput
                id="cur"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="new">New password</Label>
              <PasswordInput
                id="new"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="cf">Confirm new password</Label>
              <PasswordInput
                id="cf"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-orange hover:bg-brand-orange/90"
            >
              {saving ? "Saving…" : "Save new password"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
