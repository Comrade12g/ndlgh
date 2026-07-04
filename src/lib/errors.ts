/**
 * Extracts a human-readable message from any thrown value.
 *
 * Supabase's PostgrestError/AuthError objects are plain objects shaped like
 * { message, details, hint, code } — they do NOT extend the native Error
 * class. Checking `e instanceof Error` on them is always false, which was
 * silently swallowing every real database error behind a generic "Failed"
 * toast throughout this app. This helper handles both shapes.
 */
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    return (e as { message: string }).message;
  }
  if (typeof e === "string") return e;
  return "Something went wrong";
}
