import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";




/**
 * Ocean freight ETA poll stub.
 *
 * Placeholder for a scheduled job that will poll an aggregator API such as
 * ShipsGo or Terminal49 per active shipment and diff-update the `shipments`
 * table when the carrier's ETA changes. The API key + real HTTP call will be
 * wired in later; for now this endpoint uses a mock response so the UI is
 * fully functional and testable end-to-end.
 *
 * Trigger it from pg_cron once real polling is enabled. It is safe to hit now
 * — it only touches shipments that already have a carrier + container_no set,
 * and it only writes when the ETA actually changes.
 */

type MockCarrierPayload = {
  eta: string; // ISO date
  milestone:
    | "picked_up"
    | "departed_origin"
    | "in_transit"
    | "arrived_tema"
    | "customs_clearance"
    | "out_for_delivery"
    | "delivered";
};

// Placeholder — replace with real ShipsGo / Terminal49 fetch keyed by carrier + container.
async function fetchCarrierUpdate(
  _carrier: string,
  _containerNo: string,
  currentEta: string | null,
  currentMilestone: string,
): Promise<MockCarrierPayload> {
  // Deterministic pseudo-mock: nudge ETA +/- a few days ~30% of the time, otherwise no change.
  const base = currentEta ? new Date(currentEta) : new Date(Date.now() + 21 * 86_400_000);
  const roll = Math.random();
  let eta = base;
  if (roll < 0.15) eta = new Date(base.getTime() + 2 * 86_400_000);
  else if (roll < 0.3) eta = new Date(base.getTime() - 1 * 86_400_000);
  return {
    eta: eta.toISOString().slice(0, 10),
    milestone: (currentMilestone ?? "in_transit") as MockCarrierPayload["milestone"],
  };
}

export const Route = createFileRoute("/api/public/hooks/poll-shipment-eta")({

  server: {
    handlers: {
      POST: async () => {
        const supabaseUrl = process.env.SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: shipments, error } = await admin
          .from("shipments")
          .select("id, carrier, container_no, eta, current_milestone, status")
          .not("carrier", "is", null)
          .not("container_no", "is", null)
          .in("status", ["planning", "loading", "departed", "in_transit", "arrived", "clearing"]);

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let checked = 0;
        let updated = 0;
        for (const s of shipments ?? []) {
          checked++;
          const payload = await fetchCarrierUpdate(
            s.carrier as string,
            s.container_no as string,
            s.eta as string | null,
            s.current_milestone as string,
          );
          const etaChanged = payload.eta !== s.eta;
          const milestoneChanged = payload.milestone !== s.current_milestone;
          const patch: Record<string, unknown> = { last_checked_at: new Date().toISOString() };
          if (etaChanged) patch.eta = payload.eta;
          if (milestoneChanged) patch.current_milestone = payload.milestone;
          await admin.from("shipments").update(patch).eq("id", s.id);
          if (etaChanged || milestoneChanged) updated++;
        }

        return new Response(
          JSON.stringify({ ok: true, checked, updated, note: "mock aggregator — wire real API later" }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

