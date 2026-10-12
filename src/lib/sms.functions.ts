import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const SMS_CODES: Record<string, string> = {
  "1000": "Sent",
  "1002": "Send failed",
  "1003": "Insufficient SMS balance",
  "1004": "Invalid API key",
  "1005": "Invalid phone number",
  "1006": "Sender ID too long",
  "1007": "Scheduled",
  "1008": "Empty message",
  "1009": "Sender ID not approved",
  "1010": "Validation error",
};

/** Normalise Ghana numbers to 233XXXXXXXXX. Returns null if unusable. */
export function toBulkSmsPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/@.*$/, "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("0")) d = "233" + d.slice(1);
  else if (d.length === 9) d = "233" + d;
  if (d.length < 11 || d.length > 15) return null;
  return d;
}

async function assertStaff(supabase: any, userId: string) {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (!data) throw new Error("Staff only");
}

export const sendSms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ notificationId: z.string().uuid().optional(), phone: z.string().max(40), message: z.string().min(1).max(918) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const key = process.env.BULKSMS_API_KEY;
    const sender = process.env.BULKSMS_SENDER_ID || "NDL";
    const to = toBulkSmsPhone(data.phone);
    let code = "1005";
    if (to && key) {
      try {
        const body = new URLSearchParams({ key, to, msg: data.message, sender_id: sender });
        const res = await fetch("https://clientlogin.bulksmsgh.com/smsapi", { method: "POST", body });
        const text = (await res.text()).trim();
        const m = text.match(/\b(10\d\d)\b/);
        code = m ? m[1] : "1002";
      } catch {
        code = "1002";
      }
    } else if (!key) code = "1004";
    const ok = code === "1000" || code === "1007";
    const status = ok ? "sent" : `failed:${code}`;
    if (data.notificationId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("customer_notifications").update({ status, channel: "sms", phone: to ?? data.phone }).eq("id", data.notificationId);
    }
    return { ok, code, reason: SMS_CODES[code] ?? "Unknown" };
  });

export const getSmsBalance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const key = process.env.BULKSMS_API_KEY;
    if (!key) return { balance: null as number | null };
    try {
      const r = await fetch(`https://clientlogin.bulksmsgh.com/api/smsapibalance?key=${encodeURIComponent(key)}`);
      const n = Number((await r.text()).trim());
      return { balance: Number.isFinite(n) ? n : null };
    } catch {
      return { balance: null as number | null };
    }
  });
