import type { ExplainFacts } from "./facts";

/**
 * A cheap, mechanical check that an explanation only uses numbers the app gave the
 * model. It does not prove the sentences are true, but it catches invented salaries,
 * percentages and years, which is the way a made-up explanation usually goes wrong.
 */

/** Every number anywhere in the facts, including the ones inside the app's own reason sentences. */
export function collectNumbers(value: unknown, into: number[] = []): number[] {
  if (typeof value === "number" && Number.isFinite(value)) into.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectNumbers(v, into));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectNumbers(v, into));
  else if (typeof value === "string") {
    for (const found of extractNumbers(value)) into.push(found);
  }
  return into;
}

// A number with thousands separators (comma or any whitespace, including the
// no-break spaces some locales use) or a plain number, with an optional "k".
const NUMBER = /(\d{1,3}(?:[,\s]\d{3})+|\d+(?:\.\d+)?)(\s?[kK]\b)?/g;

/** Numbers written in a text, with "55k" read as 55000 and "55,000" as 55000. */
export function extractNumbers(text: string): number[] {
  const cleaned = text
    // "4 out of 5" and "4/5" name a scale, not a fact.
    .replace(/\bout of (?:5|100)\b/gi, "")
    .replace(/\/\s?(?:5|100)\b/g, "")
    // "year 1", "year 5", "years 1, 5 and 10" name the income horizons the app uses.
    .replace(/\byears?\s+(?:10|1|5)\b(?:\s*(?:,|\/|and|&)\s*(?:10|1|5)\b)*/gi, "");
  const numbers: number[] = [];
  for (const match of cleaned.matchAll(NUMBER)) {
    const raw = (match[1] ?? "").replace(/[,\s]/g, "");
    const value = Number(raw) * (match[2] ? 1000 : 1);
    if (Number.isFinite(value)) numbers.push(value);
  }
  return numbers;
}

/** True when `value` is one of the allowed numbers, allowing the rounding people use for money. */
function isAllowed(value: number, allowed: readonly number[]): boolean {
  return allowed.some((a) =>
    a >= 1000 ? Math.abs(value - a) <= Math.max(a * 0.01, 500) : Math.abs(value - a) < 0.51,
  );
}

/** Numbers in `text` that are not in the facts. An empty list means the text is grounded. */
export function findUngroundedNumbers(text: string, facts: ExplainFacts): number[] {
  const allowed = collectNumbers(facts);
  return extractNumbers(text).filter((n) => !isAllowed(n, allowed));
}
