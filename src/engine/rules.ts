import {
  PRIORITY_KEYS,
  SKILL_KEYS,
  type Country,
  type CountryCode,
  type Occupation,
  type PriorityKey,
  type SkillScores,
  type PriorityWeights,
} from "./types";

/**
 * The scoring rules, one small function each. Every number you might want to
 * tune lives in RULES, so changing the behaviour never means hunting through code.
 */
export const RULES = {
  /** Score used when the user gave no information on a topic (no interests, no priorities...). */
  neutral: 0.5,
  /** Interests: the lowest score an occupation gets when none of its tags match. */
  interestFloor: 0.1,
  /** Skills: score lost for each level the user is below what the job asks for. */
  skillGapPenaltyPerLevel: 0.3,
  /** Income: this yearly income (euro) counts as a full score. */
  incomeCapEUR: 120000,
  /** Income: how much year 1, 5 and 10 each count. Must add up to 1. */
  incomeYearWeights: [0.2, 0.4, 0.4] as const,
  /** Short education: this many years of education or more counts as a zero score. */
  maxEducationYears: 8,
  /** Time to independence: income years we look ahead before giving up. */
  maxWorkingYears: 10,
  /** Country fit: how much labour demand and income each count. Must add up to 1. */
  countryFitWeights: { demand: 0.6, income: 0.4 },
  /** Country fit lost for any country other than the current one, even if the user is happy to move. */
  moveBasePenalty: 0.1,
  /** Extra country fit lost for moving when stayLocal is at 1 (scaled by the slider). */
  stayLocalPenalty: 0.7,
} as const;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const clamp01 = (n: number) => clamp(n, 0, 1);

/* ---------- interests ---------- */

/**
 * Share of the occupation's interest weight the user covers, lifted off zero by
 * RULES.interestFloor so one missing tag never makes a career impossible.
 */
export function interestScore(userInterests: readonly string[], occupation: Occupation): number {
  const entries = Object.entries(occupation.interests);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (userInterests.length === 0 || total === 0) return RULES.neutral;

  const mine = new Set(userInterests.map((tag) => tag.trim().toLowerCase()));
  const matched = entries.reduce((sum, [tag, weight]) => (mine.has(tag) ? sum + weight : sum), 0);
  return RULES.interestFloor + (1 - RULES.interestFloor) * (matched / total);
}

/** Interest tags the user has that this occupation uses, strongest first. */
export function matchedInterests(
  userInterests: readonly string[],
  occupation: Occupation,
): string[] {
  const mine = new Set(userInterests.map((tag) => tag.trim().toLowerCase()));
  return Object.entries(occupation.interests)
    .filter(([tag]) => mine.has(tag))
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

/* ---------- skills ---------- */

export interface SkillGap {
  skill: string;
  required: number;
  have: number;
}

/** Skills where the user is below the level the job asks for. */
export function skillGaps(skills: SkillScores, occupation: Occupation): SkillGap[] {
  const gaps: SkillGap[] = [];
  for (const key of SKILL_KEYS) {
    const requirement = occupation.skills[key];
    if (!requirement) continue;
    const have = clamp(skills[key] ?? 1, 1, 5);
    if (have < requirement[0]) gaps.push({ skill: key, required: requirement[0], have });
  }
  return gaps;
}

/**
 * Importance-weighted average of how well each required skill is covered.
 * Meeting the level scores 1; every level short costs skillGapPenaltyPerLevel.
 * Being above the level earns nothing extra.
 */
export function skillScore(skills: SkillScores, occupation: Occupation): number {
  let weightSum = 0;
  let scoreSum = 0;
  for (const key of SKILL_KEYS) {
    const requirement = occupation.skills[key];
    if (!requirement) continue;
    const [level, weight] = requirement;
    const have = clamp(skills[key] ?? 1, 1, 5);
    const gap = Math.max(0, level - have);
    weightSum += weight;
    scoreSum += weight * clamp01(1 - gap * RULES.skillGapPenaltyPerLevel);
  }
  return weightSum === 0 ? RULES.neutral : scoreSum / weightSum;
}

/* ---------- values / priorities ---------- */

/** Turns any non-negative weights into proportions that add up to 1. No weights means all equal. */
export function normalisePriorities(weights: PriorityWeights): Record<PriorityKey, number> {
  const raw = PRIORITY_KEYS.map((key) => Math.max(0, weights[key] ?? 0));
  const total = raw.reduce((a, b) => a + b, 0);
  const out = {} as Record<PriorityKey, number>;
  PRIORITY_KEYS.forEach((key, i) => {
    out[key] = total === 0 ? 1 / PRIORITY_KEYS.length : (raw[i] ?? 0) / total;
  });
  return out;
}

/** How well the occupation delivers what the user cares about: sum of (priority share x delivery). */
export function valuesScore(priorities: PriorityWeights, occupation: Occupation): number {
  const shares = normalisePriorities(priorities);
  return PRIORITY_KEYS.reduce((sum, key) => sum + shares[key] * (occupation.values[key] ?? 0), 0);
}

/* ---------- money, education and time ---------- */

/** Yearly income in euro at a given working year, interpolated between year 1, 5 and 10. */
export function incomeAtYear(occupation: Occupation, country: Country, year: number): number {
  const [y1, y5, y10] = occupation.incomeEUR;
  const t = clamp(year, 1, 10);
  const base = t <= 5 ? y1 + ((y5 - y1) * (t - 1)) / 4 : y5 + ((y10 - y5) * (t - 5)) / 5;
  return base * country.incomeMultiplier;
}

export function educationCost(occupation: Occupation, country: Country): number {
  return occupation.educationCostEUR * country.tuitionMultiplier;
}

/**
 * Years from now until yearly income covers the country's independence level:
 * the education years (no income assumed) plus the first working year that gets there.
 * If it never does within maxWorkingYears, the cap is returned.
 */
export function timeToIndependence(occupation: Occupation, country: Country): number {
  for (let year = 1; year <= RULES.maxWorkingYears; year++) {
    if (incomeAtYear(occupation, country, year) >= country.independenceIncomeEUR) {
      return occupation.educationYears + year;
    }
  }
  return occupation.educationYears + RULES.maxWorkingYears;
}

/** 1 when independence arrives within the user's time horizon; falls off linearly as it runs past it. */
export function feasibilityScore(yearsToIndependence: number, horizonYears: number): number {
  const horizon = Math.max(1, horizonYears);
  const excess = yearsToIndependence - horizon;
  return excess <= 0 ? 1 : clamp01(1 - excess / horizon);
}

/** Income component: weighted average of years 1, 5 and 10 against the income cap. */
export function incomeScore(occupation: Occupation, country: Country): number {
  const [w1, w5, w10] = RULES.incomeYearWeights;
  const years = [1, 5, 10] as const;
  const weights = [w1, w5, w10] as const;
  const weighted = years.reduce(
    (sum, year, i) => sum + (weights[i] ?? 0) * incomeAtYear(occupation, country, year),
    0,
  );
  return clamp01(weighted / RULES.incomeCapEUR);
}

/** Short-education component: 1 for no education, 0 at maxEducationYears or more. */
export function shortEducationScore(occupation: Occupation): number {
  return clamp01(1 - occupation.educationYears / RULES.maxEducationYears);
}

/* ---------- country ---------- */

export function demandIn(occupation: Occupation, code: CountryCode): number {
  return clamp01(occupation.demandByCountry?.[code] ?? occupation.demandDefault);
}

/** How good a country is for an occupation before the user's location preferences: demand and income. */
export function baseCountryFit(occupation: Occupation, country: Country): number {
  const w = RULES.countryFitWeights;
  return (
    w.demand * demandIn(occupation, country.code) + w.income * incomeScore(occupation, country)
  );
}

/**
 * Multiplier applied to a country's fit: 1 for the current country, lower for others.
 * stayLocal is the 0-1 slider; at 0 only moveBasePenalty applies.
 */
export function moveFactor(isHome: boolean, stayLocal: number): number {
  if (isHome) return 1;
  return clamp01(1 - RULES.moveBasePenalty - RULES.stayLocalPenalty * clamp01(stayLocal));
}
