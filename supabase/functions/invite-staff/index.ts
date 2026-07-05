// Supabase Edge Function: invite-staff
//
// Lets an admin invite a new employee by email. Runs server-side with the
// service role key (never exposed to the browser) so it can:
//   1. Verify the caller is actually an admin
//   2. Create the auth user + send Supabase's built-in "set your password"
//      invite email
//   3. Assign their staff role immediately, in the same request
//
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are
// automatically available in every Edge Function's environment — no
// secrets need to be configured manually.

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
];

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

    // Verify the caller's own identity using their token (not the service key)
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) throw new Error("Invalid session");

    // Service-role client for privileged operations (bypasses RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerData.user.id);
    const isAdmin = (callerRoles ?? []).some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) throw new Error("Only admins can invite staff");

    const { email, full_name, phone, role, redirectTo } = await req.json();
    if (!email || typeof email !== "string") throw new Error("Email is required");
    if (!role || !STAFF_ROLES.includes(role)) throw new Error("A valid staff role is required");

    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        data: { full_name: full_name ?? null, phone: phone ?? null, account_type: "staff" },
        redirectTo: redirectTo ?? undefined,
      },
    );
    if (inviteError) throw inviteError;
    if (!invited.user) throw new Error("Invite succeeded but no user was returned");

    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: invited.user.id, role });
    if (roleError) throw roleError;

    return new Response(JSON.stringify({ success: true, userId: invited.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
