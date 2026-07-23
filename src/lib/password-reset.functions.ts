import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toE164Gh, phoneToSyntheticEmail } from "@/lib/phone";

const lookupSchema = z.object({ phone: z.string().trim().min(6).max(20) });

/**
 * Public endpoint: given a phone number, confirm a customer account exists
 * so the /forgot-password UI can hand them off to WhatsApp with a
 * pre-filled reset request. We deliberately do NOT reveal existence to
 * arbitrary callers — the response is always "ok" — but staff can search
 * the audit trail. SMS-native reset is unavailable (no SMS provider) and
 * the synthetic email domain is undeliverable, so a human-in-the-loop
 * reset via WhatsApp is the intended path.
 */
export const requestCustomerPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.parse(input))
  .handler(async ({ data }) => {
    const e164 = toE164Gh(data.phone);
    if (!e164) throw new Error("Enter a valid phone number");
    // Deliberately do NOT reveal whether the account exists. The response is
    // identical for known and unknown numbers so this public endpoint cannot
    // be used to enumerate registered customers. Reset is handled human-in-
    // the-loop via WhatsApp on the client.
    void phoneToSyntheticEmail(e164);
    return { ok: true, phone: e164 };
  });
