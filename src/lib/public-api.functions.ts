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
      if (error) return null;
      const row = Array.isArray(rows) ? rows[0] : rows;
      return row ?? null;
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

