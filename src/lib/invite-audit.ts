import { supabase } from "@/integrations/supabase/client";

export type WhatsAppStatus = "initiated" | "failed" | "skipped";
export type EmailStatus = "sent" | "failed" | "skipped";

export async function recordInviteWhatsapp(
  auditId: string | null | undefined,
  status: WhatsAppStatus,
  error?: string | null,
) {
  if (!auditId) return;
  try {
    await supabase
      .from("invite_audit_log")
      .update({
        whatsapp_status: status,
        whatsapp_sent_at: status === "initiated" ? new Date().toISOString() : null,
        whatsapp_error: error ?? null,
      })
      .eq("id", auditId);
  } catch (e) {
    console.warn("Failed to update invite audit log", e);
  }
}

export async function recordInviteEmail(
  auditId: string | null | undefined,
  status: EmailStatus,
  error?: string | null,
) {
  if (!auditId) return;
  try {
    await supabase
      .from("invite_audit_log")
      .update({
        email_status: status,
        email_sent_at: status === "sent" ? new Date().toISOString() : null,
        email_error: error ?? null,
      })
      .eq("id", auditId);
  } catch (e) {
    console.warn("Failed to update invite audit log", e);
  }
}
