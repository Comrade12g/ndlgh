import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { toE164Gh, phoneToSyntheticEmail } from "@/lib/phone";

const phoneSchema = z.object({ phone: z.string().trim().min(6).max(20) });

/**
 * Update the signed-in customer's phone number and migrate their auth
 * identifier (synthetic email + phone column on auth.users) to match, so
 * they can keep signing in with the new number.
 */
export const updateCustomerPhone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => phoneSchema.parse(input))
  .handler(async ({ data, context }) => {
    const e164 = toE164Gh(data.phone);
    if (!e164) throw new Error("Enter a valid phone number");
    const newEmail = phoneToSyntheticEmail(e164);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure the phone isn't already taken by another account.
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", e164)
      .neq("id", context.userId)
      .maybeSingle();
    if (existing) throw new Error("Another account already uses that phone number");

    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      email: newEmail,
      phone: e164,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { phone: e164 },
    });
    if (authErr) throw new Error(authErr.message);

    const { error: profErr } = await supabaseAdmin
      .from("profiles")
      .update({ phone: e164 })
      .eq("id", context.userId);
    if (profErr) throw new Error(profErr.message);

    return { ok: true, phone: e164 };
  });

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(72),
});

/** Change the signed-in user's password after re-verifying the current one. */
export const changeMyPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => passwordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const email = context.claims.email as string | undefined;
    if (!email) throw new Error("Account has no login identifier");

    const { createClient } = await import("@supabase/supabase-js");
    const check = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: verifyErr } = await check.auth.signInWithPassword({
      email,
      password: data.currentPassword,
    });
    if (verifyErr) throw new Error("Current password is incorrect");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
