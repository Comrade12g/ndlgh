import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Strip characters that would break out of a PostgREST filter expression (commas, parens, dots, colons, wildcards). */
export function sanitizePostgrestTerm(term: string): string {
  return term.replace(/[,().:%*\\]/g, "").trim();
}
