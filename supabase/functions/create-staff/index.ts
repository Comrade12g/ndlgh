// Supabase Edge Function: create-staff
//
// Admin-only staff onboarding. Mirrors create-customer: creates an auth
// account keyed by the employee's phone number (via a synthetic staff
// email), assigns their staff role, and returns a temporary password the
// admin can share. First sign-in will force them to change it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAFF_ROLES = [
  "admin",
  "ops_warehouse",
  "sales",
  "accountant",
  "customer_service",
  "sourcing_agent",
  "driver",
  "sales_accountant",
];

function normalizeToE164(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("233")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return `+${digits}`;
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) throw new Error("Invalid session");

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerData.user.id);
    const isAdmin = (callerRoles ?? []).some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) throw new Error("Only admins can add employees");

    const { phone, full_name, role } = await req.json();
    if (!phone || typeof phone !== "string") throw new Error("Phone number is required");
    if (!role || !STAFF_ROLES.includes(role)) throw new Error("A valid staff role is required");

    const e164 = normalizeToE164(phone);
    if (!e164) throw new Error("Couldn't understand that phone number");

    const digits = e164.replace(/[^\d]/g, "");
    const syntheticEmail = `${digits}@staff.ndlgh.local`;
    const tempPassword = generateTempPassword();

    let userId: string | null = null;
    let reused = false;

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      phone: e164,
      password: tempPassword,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { full_name: full_name ?? null, phone: e164, account_type: "staff" },
    });

    if (createError) {
      const msg = createError.message?.toLowerCase() ?? "";
      const isDuplicate =
        msg.includes("already been registered") ||
        msg.includes("already exists") ||
        msg.includes("duplicate") ||
        msg.includes("phone");
      if (!isDuplicate) throw createError;

      const { data: list } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 200 });
      const match = list?.users.find(
        (u) => u.email === syntheticEmail || u.phone === e164 || u.phone === digits,
      );
      if (!match) throw new Error("An employee with this phone number already has an account");

      const { error: updateError } = await adminClient.auth.admin.updateUserById(match.id, {
        password: tempPassword,
        email: syntheticEmail,
        phone: e164,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { full_name: full_name ?? null, phone: e164, account_type: "staff" },
      });
      if (updateError) throw updateError;
      userId = match.id;
      reused = true;
    } else {
      if (!created.user) throw new Error("Account creation succeeded but no user was returned");
      userId = created.user.id;
    }

    // Upsert profile fields (trigger creates the row on new signups)
    await adminClient
      .from("profiles")
      .upsert(
        { id: userId!, full_name: full_name ?? null, phone: e164, must_change_password: true },
        { onConflict: "id" },
      );

    // Ensure the staff role is assigned; strip any accidental 'customer' role.
    await adminClient.from("user_roles").delete().eq("user_id", userId!).eq("role", "customer");
    const { error: roleError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: userId!, role }, { onConflict: "user_id,role" });
    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ success: true, userId, phone: e164, tempPassword, reused }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
