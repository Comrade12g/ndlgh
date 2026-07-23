import { getErrorMessage } from "@/lib/errors";

/**
 * Maps Supabase auth errors to specific, actionable messages for the
 * sign-in form. Anything not recognized falls back to the raw message so
 * we never mask real errors (network, server outages, rate limits, etc.).
 */
export function friendlySignInError(err: unknown): {
  title: string;
  description: string;
  showHelp: boolean;
} {
  const raw = getErrorMessage(err).toLowerCase();

  if (raw.includes("invalid login credentials") || raw.includes("invalid_credentials")) {
    return {
      title: "That phone or password didn't match",
      description:
        "Double-check your number (with country code) or email, and your password. If you've never set a password, tap “Need help signing in?” below.",
      showHelp: true,
    };
  }
  if (raw.includes("email not confirmed") || raw.includes("email_not_confirmed")) {
    return {
      title: "Account not activated yet",
      description:
        "Your account is still being set up. Message us on WhatsApp and we'll activate it for you.",
      showHelp: true,
    };
  }
  if (raw.includes("user not found") || raw.includes("no user found")) {
    return {
      title: "We couldn't find that account",
      description:
        "New customers are onboarded personally. Tap “Need help signing in?” to reach us on WhatsApp.",
      showHelp: true,
    };
  }
  if (raw.includes("rate limit") || raw.includes("too many")) {
    return {
      title: "Too many attempts",
      description: "Please wait a minute before trying again, or contact support on WhatsApp.",
      showHelp: true,
    };
  }
  if (raw.includes("valid phone")) {
    return {
      title: "Enter a valid phone number",
      description: "Use your Ghana number, e.g. 024xxxxxxx or +233 24 xxx xxxx.",
      showHelp: false,
    };
  }
  if (raw.includes("network") || raw.includes("failed to fetch")) {
    return {
      title: "Connection problem",
      description: "Check your internet connection and try again.",
      showHelp: false,
    };
  }

  return {
    title: "Sign-in failed",
    description: getErrorMessage(err),
    showHelp: true,
  };
}

export const SUPPORT_WHATSAPP_NUMBER = "+233500229352";
export const SUPPORT_WHATSAPP_MESSAGE =
  "Hi NDL Ghana! I'm having trouble signing in to my account and need help.";
