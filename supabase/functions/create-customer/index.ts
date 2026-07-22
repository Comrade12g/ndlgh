// Supabase Edge Function: create-customer
//
// Lets staff create a customer's portal login using just their phone
// number — no email, no self-service sign-up. Generates a temporary
// password and returns it (along with the assigned shipping mark) so
// staff can send it to the customer over WhatsApp themselves.
//
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are
// automatically available in every Edge Function's environment.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAFF_ROLES_ALLOWED = [
  "admin",
  "sales",
  "customer_service",
  "sales_accountant",
  "accountant",
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const isAllowed = (callerRoles ?? []).some((r: { role: string }) =>
      STAFF_ROLES_ALLOWED.includes(r.role),
    );
    if (!isAllowed) throw new Error("You don't have permission to create customer accounts");

    const { phone, full_name } = await req.json();
    if (!phone || typeof phone !== "string") throw new Error("Phone number is required");

    const e164 = normalizeToE164(phone);
    if (!e164) throw new Error("Couldn't understand that phone number");

    const tempPassword = generateTempPassword();

    const syntheticEmail = `${e164.replace(/[^\d]/g, "")}@customers.ndlgh.local`;

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      phone: e164,
      password: tempPassword,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { full_name: full_name ?? null, phone: e164 },
    });
    if (createError) {
      if (
        createError.message?.toLowerCase().includes("already been registered") ||
        createError.message?.toLowerCase().includes("already exists")
      ) {
        throw new Error("A customer with this phone number already has an account");
      }
      throw createError;
    }
    if (!created.user) throw new Error("Account creation succeeded but no user was returned");

    // Fetch the auto-generated shipping mark from their new profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("shipping_mark")
      .eq("id", created.user.id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        userId: created.user.id,
        phone: e164,
        tempPassword,
        shippingMark: profile?.shipping_mark ?? null,
      }),
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
