import type { Country, CountryCode } from "./types";

/**
 * Mock country data. Replace with real statistics later; the engine only reads
 * these fields.
 */
export const COUNTRIES: readonly Country[] = [
  {
    code: "NO",
    name: "Norway",
    incomeMultiplier: 1.15,
    tuitionMultiplier: 0.2,
    independenceIncomeEUR: 38000,
  },
  {
    code: "SE",
    name: "Sweden",
    incomeMultiplier: 0.92,
    tuitionMultiplier: 0.2,
    independenceIncomeEUR: 31000,
  },
  {
    code: "DK",
    name: "Denmark",
    incomeMultiplier: 1.1,
    tuitionMultiplier: 0.15,
    independenceIncomeEUR: 36000,
  },
  {
    code: "DE",
    name: "Germany",
    incomeMultiplier: 1.0,
    tuitionMultiplier: 0.25,
    independenceIncomeEUR: 30000,
  },
  {
    code: "NL",
    name: "Netherlands",
    incomeMultiplier: 1.05,
    tuitionMultiplier: 0.6,
    independenceIncomeEUR: 32000,
  },
  {
    code: "UK",
    name: "United Kingdom",
    incomeMultiplier: 0.98,
    tuitionMultiplier: 1.6,
    independenceIncomeEUR: 30000,
  },
  {
    code: "US",
    name: "United States",
    incomeMultiplier: 1.45,
    tuitionMultiplier: 2.6,
    independenceIncomeEUR: 36000,
  },
];

export function getCountry(code: CountryCode): Country {
  const country = COUNTRIES.find((c) => c.code === code);
  if (!country) throw new Error(`Unknown country code: ${code}`);
  return country;
}

/**
 * Which countries count as "nearby" for someone willing to move only a short way.
 * Edit this table to change what nearby means.
 */
export const NEARBY: Readonly<Record<CountryCode, readonly CountryCode[]>> = {
  NO: ["SE", "DK"],
  SE: ["NO", "DK"],
  DK: ["NO", "SE", "DE"],
  DE: ["NL", "DK"],
  NL: ["DE", "UK"],
  UK: ["NL"],
  US: [],
};
