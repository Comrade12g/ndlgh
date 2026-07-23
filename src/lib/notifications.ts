/**
 * Customer notification helper.
 *
 * Logs every prepared customer message to `customer_notifications`, and
 * (for the wa.me click-to-chat flow) opens WhatsApp in a new tab with the
 * message pre-filled so staff only tap Send.
 *
 * The DB row is the source of truth: staff can look at pending notifications
 * later even if they closed the WhatsApp tab. If/when NDL wires a real
 * WhatsApp Business API, only the send half changes — logs stay identical.
 */
import { supabase } from "@/integrations/supabase/client";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

export type NotificationEvent =
  | "package_received"
  | "shipment_departed"
  | "shipment_arrived"
  | "shipment_cleared"
  | "shipment_delivered"
  | "invoice_issued"
  | "delivery_scheduled"
  | "delivery_out_for_delivery"
  | "delivery_delivered"
  | "delivery_failed"
  | "payment_received";

export type NotifyInput = {
  customerId: string | null | undefined;
  phone: string | null | undefined;
  event: NotificationEvent;
  message: string;
  packageId?: string | null;
  shipmentId?: string | null;
  invoiceId?: string | null;
  deliveryId?: string | null;
  /** If true, immediately open WhatsApp with the message. Default true. */
  autoOpen?: boolean;
};

/**
 * Persist the notification, then (optionally) open WhatsApp.
 *
 * Returns the row id on success, null on failure — never throws so callers
 * don't have to wrap in try/catch inside mutation success handlers.
 */
export async function notifyCustomer(input: NotifyInput): Promise<string | null> {
  if (!input.customerId) return null;
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("customer_notifications")
    .insert({
      customer_id: input.customerId,
      event_type: input.event,
      channel: "whatsapp",
      phone: input.phone ?? null,
      message: input.message,
      package_id: input.packageId ?? null,
      shipment_id: input.shipmentId ?? null,
      invoice_id: input.invoiceId ?? null,
      delivery_id: input.deliveryId ?? null,
      triggered_by: u.user?.id ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("notifyCustomer log failed", error);
  }

  if (input.autoOpen !== false && input.phone) {
    const opened = openWhatsApp(input.phone, input.message);
    if (opened && data?.id) {
      // Mark clicked (best effort)
      supabase
        .from("customer_notifications")
        .update({ status: "clicked" })
        .eq("id", data.id)
        .then(() => {});
      toast.success("WhatsApp opened — review and send");
    } else if (!opened) {
      toast.info("Notification logged — no valid phone to open WhatsApp");
    }
  }

  return data?.id ?? null;
}
