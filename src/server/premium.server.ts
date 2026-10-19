import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Premium access, checked on the server for every request.
 *
 * There are no accounts or payments in the app yet, so Premium is switched on with
 * an access code: set PREMIUM_ACCESS_CODES to a comma-separated list of long random
 * codes. When real billing exists, replace isValidPremiumCode with a check against
 * the subscription; nothing else needs to change.
 */

const digest = (value: string) => createHash("sha256").update(value).digest();

/** The configured codes, hashed once so each comparison takes the same time. */
function configuredDigests(raw: string | undefined): Buffer[] {
  return (raw ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter((code) => code.length >= 12)
    .map(digest);
}

export function isValidPremiumCode(
  code: string,
  raw: string | undefined = process.env["PREMIUM_ACCESS_CODES"],
): boolean {
  const candidate = digest(code);
  let valid = false;
  for (const known of configuredDigests(raw)) {
    // Compare against every code, so timing does not reveal which one was close.
    if (timingSafeEqual(candidate, known)) valid = true;
  }
  return valid;
}

/** A stable, non-reversible key for rate limiting, so codes are never stored in memory as plain text. */
export function codeKey(code: string): string {
  return digest(code).toString("hex").slice(0, 16);
}
