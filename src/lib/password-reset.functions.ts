import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toE164Gh, phoneToSyntheticEmail } from "@/lib/phone";

const lookupSchema = z.object({ phone: z.string().trim().min(6).max(20) });

function tempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

/**
 * Public endpoint: customer enters their phone; if a customer account exists,
 * a new temporary password is generated and sent by SMS (BulkSMS). The
 * response is identical for known and unknown numbers (no enumeration).
 * Limited to one reset per 10 minutes and 3 per day per customer.
 */
export const requestCustomerPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.parse(input))
  .handler(async ({ data }) => {
    const e164 = toE164Gh(data.phone);
    if (!e164) throw new Error("Enter a valid phone number");
    const generic = { ok: true, phone: e164 };

    const key = process.env.BULKSMS_API_KEY;
    if (!key) return generic;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, shipping_mark")
      .eq("phone", e164)
      .maybeSingle();
    if (!prof) return generic;

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(prof.id);
    if (authUser?.user?.email !== phoneToSyntheticEmail(e164)) return generic;

    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("customer_notifications")
      .select("created_at")
      .eq("customer_id", prof.id)
      .eq("event_type", "password_reset")
      .gte("created_at", dayAgo);
    const list = recent ?? [];
    if (list.length >= 3) return generic;
    if (list.some((r) => Date.now() - new Date(r.created_at).getTime() < 600000)) return generic;

    const pw = tempPassword();
    const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(prof.id, { password: pw });
    if (upErr) {
      console.error("reset update failed", upErr);
      return generic;
    }
    await supabaseAdmin.from("profiles").update({ must_change_password: true }).eq("id", prof.id);

    const local = "0" + e164.replace(/^\+233/, "");
    const msg = `NDL (Next Day Logistics) password reset.\nEntry number: ${prof.shipping_mark ?? "-"}\nLogin: https://www.ndlgh.com/auth\nPhone: ${local}\nTemporary password: ${pw}\nYou will set a new password after login.\n\n— NDL (Next Day Logistics)\nPortal: https://www.ndlgh.com/portal\nWhatsApp: 0500229352`;

    const to = e164.replace(/\D/g, "");
    let code = "1002";
    try {
      const body = new URLSearchParams({ key, to, msg, sender_id: process.env.BULKSMS_SENDER_ID || "NDL" });
      const res = await fetch("https://clientlogin.bulksmsgh.com/smsapi", { method: "POST", body });
      const m = (await res.text()).match(/\b(10\d\d)\b/);
      code = m ? m[1] : "1002";
    } catch {
      code = "1002";
    }
    const ok = code === "1000" || code === "1007";
    // Log without the password itself.
    await supabaseAdmin.from("customer_notifications").insert({
      customer_id: prof.id,
      event_type: "password_reset",
      channel: "sms",
      phone: to,
      message: msg.replace(pw, "••••••••"),
      status: ok ? "sent" : `failed:${code}`,
    });
    return generic;
  });
