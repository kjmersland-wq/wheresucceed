import { COUNTRIES as ENGINE_COUNTRIES, type CountryCode } from "@/engine";

const FLAGS: Record<CountryCode, string> = {
  NO: "🇳🇴",
  SE: "🇸🇪",
  DK: "🇩🇰",
  DE: "🇩🇪",
  NL: "🇳🇱",
  UK: "🇬🇧",
  US: "🇺🇸",
};

/**
 * Every country the scoring engine can return, with a flag for display. The older
 * list in data.ts has no Denmark, so a result in Denmark would have no label there.
 */
export const COUNTRIES: readonly { code: CountryCode; name: string; flag: string }[] =
  ENGINE_COUNTRIES.map((c) => ({ code: c.code, name: c.name, flag: FLAGS[c.code] }));
