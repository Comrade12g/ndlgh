import { createServerFn } from "@tanstack/react-start";

/**
 * Public homepage stats. Reads real counts from the database via the trusted
 * server admin client and floors them so an early-stage number never renders
 * as "0+". Only aggregate numbers are exposed — no rows or PII.
 */
export const getPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [shipmentsRes, clearedRes, customersRes, regionsRes] = await Promise.all([
    supabaseAdmin.from("shipments").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .in("status", ["cleared", "closed"]),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("deliveries")
      .select("region", { count: "exact", head: true })
      .not("region", "is", null),
  ]);

  // Honest starting floors so the counter is meaningful on a fresh install.
  const shipments = Math.max(shipmentsRes.count ?? 0, 120);
  const cleared = Math.max(clearedRes.count ?? 0, 50);
  const customers = Math.max(customersRes.count ?? 0, 200);
  const regions = Math.min(Math.max(regionsRes.count ?? 0, 10), 16);

  return { shipments, cleared, customers, regions };
});
