/** Normalizes a Ghanaian (or already-international) phone number to E.164 format (e.g. "+233501234567"). */
export function toE164Gh(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("233")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return `+${digits}`;
}

/**
 * Turns an E.164 phone number into the synthetic email we use as the
 * customer's Supabase auth identifier. Phone-native auth needs an SMS
 * provider that isn't configured, so customers log in with phone + password
 * against this deterministic email under the hood.
 */
export function phoneToSyntheticEmail(e164: string): string {
  const digits = e164.replace(/[^\d]/g, "");
  return `${digits}@customers.ndlgh.local`;
}
