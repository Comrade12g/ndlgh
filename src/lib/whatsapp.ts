/**
 * WhatsApp click-to-chat helper.
 *
 * No API keys, no Meta Business approval, no cost — just opens WhatsApp
 * (app or web) with the customer's number and a message pre-filled. Staff
 * review and hit send themselves. This is the fastest path to "notify the
 * customer" with zero provider setup; if/when NDL sets up the WhatsApp
 * Business API (Twilio, Meta Cloud API, etc.) this same call sites can be
 * swapped for an automatic send without changing the surrounding UI.
 */

/** Normalizes a Ghanaian (or already-international) number to E.164 digits, no plus sign (wa.me format). */
export function normalizeGhPhone(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `233${digits.slice(1)}`;
  if (digits.length === 9) return `233${digits}`;
  return digits; // assume already-international for non-GH numbers
}

/** Builds a wa.me link that opens WhatsApp with the message pre-filled. Returns null if the phone is unusable. */
export function buildWhatsAppLink(
  phone: string | null | undefined,
  message: string,
): string | null {
  const normalized = phone ? normalizeGhPhone(phone) : null;
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** Opens the WhatsApp link in a new tab. Call this from a button's onClick. */
export function openWhatsApp(phone: string | null | undefined, message: string): boolean {
  const link = buildWhatsAppLink(phone, message);
  if (!link) return false;
  window.open(link, "_blank", "noopener,noreferrer");
  return true;
}

/** Copies text to the clipboard. Returns true on success — use as a fallback when WhatsApp Web won't refresh an already-open chat's draft. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const SIGNOFF = "— NDL Global Shipping";

/** Returns the app origin at call time. Falls back to the production URL during SSR. */
function appOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "https://ndlgh.susuboxgh.com";
}

const portalLink = () => `${appOrigin()}/portal`;
const trackLink = (code: string) => `${appOrigin()}/track/${encodeURIComponent(code)}`;
const authLink = () => `${appOrigin()}/auth`;

export const waTemplates = {
  packageReceived: (name: string, trackingCode: string, warehouse: string) =>
    `Hi ${name}, good news — your package (${trackingCode}) has been received at our ${warehouse} warehouse and is being processed. Track it here: ${trackLink(trackingCode)}\n\nView all your shipments: ${portalLink()}\n${SIGNOFF}`,

  shipmentDeparted: (name: string, ref: string, eta: string | null) =>
    `Hi ${name}, your shipment ${ref} has departed origin and is now in transit${eta ? ` — ETA ${eta}` : ""}. Track: ${trackLink(ref)}\n${SIGNOFF}`,

  shipmentArrived: (name: string, ref: string) =>
    `Hi ${name}, your shipment ${ref} has arrived at Tema Port. Customs clearance is next. Track: ${trackLink(ref)}\n${SIGNOFF}`,

  shipmentCleared: (name: string, ref: string) =>
    `Hi ${name}, your shipment ${ref} has cleared customs. We'll schedule delivery shortly. Track: ${trackLink(ref)}\n${SIGNOFF}`,

  deliveryScheduled: (name: string, code: string, city: string, date: string | null) =>
    `Hi ${name}, your delivery ${code} to ${city} has been scheduled${date ? ` for ${date}` : ""}. We'll let you know when it's out for delivery.\n\nTrack: ${trackLink(code)}\n${SIGNOFF}`,

  deliveryOutForDelivery: (name: string, code: string) =>
    `Hi ${name}, your delivery ${code} is out for delivery today! Please have someone available to receive it.\n\nTrack: ${trackLink(code)}\n${SIGNOFF}`,

  deliveryDelivered: (name: string, code: string) =>
    `Hi ${name}, your delivery ${code} has been delivered. Thank you for shipping with NDL!\n\nView receipt: ${portalLink()}\n${SIGNOFF}`,

  deliveryFailed: (name: string, code: string) =>
    `Hi ${name}, we attempted delivery ${code} but couldn't complete it. Please reply here to reschedule.\n\nDetails: ${trackLink(code)}\n${SIGNOFF}`,

  invoiceIssued: (
    name: string,
    number: string,
    currency: string,
    total: number,
    dueDate: string | null,
  ) =>
    `Hi ${name}, invoice ${number} for ${currency} ${total.toFixed(2)} has been issued${dueDate ? `, due ${dueDate}` : ""}. Reply here for payment details (MoMo/bank).\n\nView invoice: ${portalLink()}\n${SIGNOFF}`,

  paymentReceived: (
    name: string,
    number: string,
    currency: string,
    amount: number,
    outstanding: number,
  ) =>
    `Hi ${name}, we've received your payment of ${currency} ${amount.toFixed(2)} for invoice ${number}. ${
      outstanding > 0
        ? `Remaining balance: ${currency} ${outstanding.toFixed(2)}.`
        : "Invoice fully paid — thank you!"
    }\n\nView statement: ${portalLink()}\n${SIGNOFF}`,

  staffCredentials: (name: string, phone: string, tempPassword: string, role: string) =>
    `Hi ${name || "there"}, welcome to the NDL team! Your ${role.replace(/_/g, " ")} account is ready.\n\nPhone: ${phone}\nTemporary password: ${tempPassword}\n\nSign in here: ${authLink()}\nYou'll be asked to set your own password on first sign-in.\n${SIGNOFF}`,
};
