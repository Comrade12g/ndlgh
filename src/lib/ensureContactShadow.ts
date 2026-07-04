import { supabase } from "@/integrations/supabase/client";

/**
 * TEMPORARY WORKAROUND — remove once the live database has the
 * customer_id FK fix applied (see supabase/migrations/20260703000002_*).
 *
 * Several tables (packages, deliveries, invoices, payments, purchase_orders,
 * sourcing_requests, transactions) have a customer_id column that's
 * *supposed* to reference profiles(id), but a stray migration on the live
 * database also added a second, wrong foreign key forcing the same value
 * to exist in contacts(id) too. Until that's fixed at the database level,
 * any insert linking a real customer profile fails with:
 *   "insert or update on table X violates foreign key constraint ..._fk"
 *
 * This works around it by making sure a contacts row exists whose id
 * exactly matches the customer's profile id — satisfying the broken
 * constraint without touching the database directly. This is harmless
 * either way: every real customer arguably should have a CRM contact
 * record regardless of this bug, and this call is a no-op once one
 * already exists.
 */
export async function ensureContactShadow(
  profileId: string,
  fullName?: string | null,
  phone?: string | null,
): Promise<void> {
  if (!profileId) return;
  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("id", profileId)
    .maybeSingle();
  if (existing) return;

  const { error } = await supabase.from("contacts").insert({
    id: profileId,
    customer_id: profileId,
    full_name: fullName?.trim() || "Customer",
    phone: phone || null,
    type: "customer",
    status: "active",
    source: "auto (portal signup)",
  });
  // Don't block the caller's real action over this — if it fails (e.g. a
  // race where another request created it first), the original insert
  // will surface its own error if the shadow row still doesn't exist.
  if (error && error.code !== "23505") {
    console.warn("ensureContactShadow failed:", error.message);
  }
}
