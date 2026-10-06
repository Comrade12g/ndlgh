import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Use digits only"),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  serviceNeeded: z.enum(["supplier_payment", "procurement", "training", "shipping_payment"]),
  whatToBuy: z.string().trim().max(1000).optional().or(z.literal("")),
  budget: z.string().trim().max(100).optional().or(z.literal("")),
  supplierLocation: z.enum(["guangzhou", "yiwu", "other", ""]).optional(),
  contactTime: z.string().trim().max(100).optional().or(z.literal("")),
  experienceLevel: z.enum(["beginner", "some", "experienced", ""]).optional(),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted" }) }),
  // Spam protection
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.number(),
});

export type ServiceRequestInput = z.infer<typeof schema>;

export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot filled or form submitted too fast => silently accept, don't store.
    if (data.website || Date.now() - data.startedAt < 3000) return { ok: true as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("service_requests").insert({
      full_name: data.fullName,
      phone: data.phone,
      email: data.email ? data.email.toLowerCase() : null,
      service_needed: data.serviceNeeded,
      what_to_buy_or_pay_for: data.whatToBuy || null,
      approximate_amount_or_budget: data.budget || null,
      supplier_location: data.supplierLocation || null,
      preferred_contact_time: data.contactTime || null,
      experience_level: data.experienceLevel || null,
      message: data.message || null,
      consent_to_contact: true,
    });
    if (error) {
      console.error("[service-requests] insert failed", error);
      return { ok: false as const, error: "We couldn't send that just now. Please try again or WhatsApp us." };
    }
    return { ok: true as const };
  });
