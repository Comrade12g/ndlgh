import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function serverPublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getPublicShipmentStatus = createServerFn({ method: "GET" })
  .inputValidator((d: { ref: string }) => ({ ref: String(d.ref ?? "").trim().toUpperCase() }))
  .handler(async ({ data }) => {
    if (!data.ref) return null;
    try {
      // Use admin client server-side so we can revoke anon EXECUTE on the
      // SECURITY DEFINER RPC while keeping public tracking working.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows, error } = await supabaseAdmin.rpc("get_public_shipment_status", { _ref: data.ref });
      const row = !error ? (Array.isArray(rows) ? rows[0] : rows) : null;
      if (row) return row;

      // Fallback: package received at warehouse but not yet loaded into a shipment.
      const ref = data.ref.replace(/[^A-Z0-9-]/g, "");
      if (!ref) return null;
      const { data: pkg } = await supabaseAdmin
        .from("packages")
        .select("tracking_code, external_tracking, shipping_mark, pieces, weight_kg, cbm, received_at, updated_at, warehouse_code")
        .or(`tracking_code.ilike.${ref},external_tracking.ilike.${ref}`)
        .order("received_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      if (!pkg) return null;
      let originName: string | null = pkg.warehouse_code;
      if (pkg.warehouse_code) {
        const { data: w } = await supabaseAdmin.from("warehouses").select("name").eq("code", pkg.warehouse_code).maybeSingle();
        originName = w?.name ?? pkg.warehouse_code;
      }
      return {
        ndl_reference: pkg.tracking_code,
        origin_city: originName,
        destination_city: "Tema, Ghana",
        current_milestone: "picked_up",
        current_eta: null,
        eta_last_changed_at: null,
        eta_recently_changed: false,
        mode: null,
        matched_mark: pkg.shipping_mark,
        etd: null,
        original_eta: null,
        actual_departure: null,
        actual_arrival: null,
        last_checked_at: pkg.updated_at,
        vessel_or_flight: null,
        carrier: null,
        pieces: pkg.pieces,
        weight_kg: pkg.weight_kg,
        cbm: pkg.cbm,
        package_count: 1,
        received_at: pkg.received_at,
        awaiting_loading: true,
      };

    } catch (e) {
      console.error("getPublicShipmentStatus failed", e);
      return null;
    }
  });


export const getIndicativeRate = createServerFn({ method: "GET" })
  .inputValidator((d: { origin: string; mode: string; weightKg: number; cbm: number }) => ({
    origin: String(d.origin ?? "").toUpperCase().slice(0, 16),
    mode: String(d.mode ?? "sea_lcl"),
    weightKg: Math.max(0, Number(d.weightKg) || 0),
    cbm: Math.max(0, Number(d.cbm) || 0),
  }))
  .handler(async ({ data }) => {
    try {
      // Rates are not publicly readable via anon; use trusted server client and
      // return only the derived indicative amount, never raw rate rows.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rates, error } = await supabaseAdmin
        .from("rates")
        .select("unit, price, currency, origin_code, mode, effective_from")
        .eq("active", true)
        .eq("mode", data.mode as Database["public"]["Enums"]["shipment_mode"])
        .order("effective_from", { ascending: false });
      if (error || !rates) return { available: false as const };

      const filtered = rates.filter(
        (r) => !r.origin_code || r.origin_code === data.origin,
      );
      const kg = filtered.find((r) => r.unit === "KG");
      const cbm = filtered.find((r) => r.unit === "CBM");

      const amtKg = kg ? Number(kg.price) * data.weightKg : 0;
      const amtCbm = cbm ? Number(cbm.price) * data.cbm : 0;

      if (!kg && !cbm) return { available: false as const };

      const useCbm = amtCbm > amtKg;
      return {
        available: true as const,
        unit: useCbm ? ("CBM" as const) : ("KG" as const),
        qty: useCbm ? data.cbm : data.weightKg,
        unit_price: useCbm ? Number(cbm!.price) : Number(kg!.price),
        amount: useCbm ? amtCbm : amtKg,
        currency: (useCbm ? cbm!.currency : kg!.currency) ?? "USD",
        chargeable_weight_kg: useCbm ? data.cbm * 167 : data.weightKg,
      };
    } catch (e) {
      console.error("getIndicativeRate failed", e);
      return { available: false as const };
    }
  });

