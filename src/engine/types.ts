/**
 * Types for the career scoring engine.
 *
 * Everything here is plain data: no React, no storage, no network. The engine
 * takes a UserProfile and returns CareerMatch rows, and the same input always
 * gives the same output.
 */

export type CountryCode = "NO" | "SE" | "DK" | "DE" | "NL" | "UK" | "US";

/** Skills the user rates from 1 (weak) to 5 (strong). */
export const SKILL_KEYS = [
  "math",
  "communication",
  "creativity",
  "practical",
  "leadership",
  "focus",
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

/** What the user wants from a career. The user gives each one a weight. */
export const PRIORITY_KEYS = [
  "income",
  "stability",
  "impact",
  "freedom",
  "prestige",
  "balance",
] as const;
export type PriorityKey = (typeof PRIORITY_KEYS)[number];

/** Interest tags the mock data uses. Unknown tags in a profile are ignored, never an error. */
export const INTEREST_TAGS = [
  "tech",
  "analytical",
  "business",
  "creative",
  "people",
  "teaching",
  "health",
  "handson",
  "nature",
  "law",
] as const;
export type InterestTag = (typeof INTEREST_TAGS)[number];

export type SkillScores = Record<SkillKey, number>;

/** Any non-negative numbers: only the proportions matter. Missing keys count as 0. */
export type PriorityWeights = Partial<Record<PriorityKey, number>>;

/**
 * - stay: only the current country is considered
 * - nearby: the current country and its neighbours (see NEARBY in countries.ts)
 * - anywhere: every country in the data
 */
export type MobilityPreference = "stay" | "nearby" | "anywhere";

export interface Constraints {
  willingToMove: MobilityPreference;
  /** How many years from now the user wants to be financially independent. */
  timeHorizonYears: number;
  currentCountry: CountryCode;
}

export interface UserProfile {
  interests: readonly string[];
  skills: SkillScores;
  priorities: PriorityWeights;
  constraints: Constraints;
}

/**
 * The three sliders the user can move after seeing a first result. Each is 0 to 1.
 * - incomeFocus: how much earnings count in the ranking
 * - stayLocal: how much staying in the current country counts
 * - shortEducation: how much a short education counts
 */
export interface PreferenceWeights {
  incomeFocus: number;
  stayLocal: number;
  shortEducation: number;
}

/* ---------- occupation data ---------- */

/** [required level 1-5, importance 1-3] */
export type SkillRequirement = readonly [level: number, weight: number];

/** ISCO-08 major groups: 1 managers ... 9 elementary occupations. */
export type IscoGroup = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Occupation {
  /** ISCO-08 unit group code, for example "2512". */
  isco: string;
  title: string;
  iscoGroup: IscoGroup;
  /** Relevance of each interest tag to this occupation, 0 to 1. */
  interests: Readonly<Record<string, number>>;
  skills: Readonly<Partial<Record<SkillKey, SkillRequirement>>>;
  /** How well the occupation delivers each priority, 0 to 1. */
  values: Readonly<Record<PriorityKey, number>>;
  educationYears: number;
  /** Total education cost in euro at tuition multiplier 1.0; scaled per country. */
  educationCostEUR: number;
  /** Gross yearly income in euro at income multiplier 1.0: year 1, year 5, year 10 of working. */
  incomeEUR: readonly [year1: number, year5: number, year10: number];
  /** Labour demand 0 to 1 when a country has no entry in demandByCountry. */
  demandDefault: number;
  demandByCountry?: Readonly<Partial<Record<CountryCode, number>>>;
}

export interface Country {
  code: CountryCode;
  name: string;
  /** Multiplies base incomes. 1.0 is roughly Germany. */
  incomeMultiplier: number;
  /** Multiplies base education cost. */
  tuitionMultiplier: number;
  /** Yearly gross income, in euro, that covers a modest independent life here. */
  independenceIncomeEUR: number;
}

/* ---------- engine output ---------- */

/** Every component is 0 to 100 so it can be shown next to the match score. */
export interface ScoreBreakdown {
  interests: number;
  skills: number;
  values: number;
  feasibility: number;
  countryFit: number;
  income: number;
  shortEducation: number;
}

export interface CareerMatch {
  rank: number;
  isco: string;
  title: string;
  iscoGroup: IscoGroup;
  /** 0 to 100. */
  matchScore: number;
  /** Euro per year, in bestCountry. */
  incomeYear1: number;
  incomeYear5: number;
  incomeYear10: number;
  /** Total education cost in euro, in bestCountry. */
  educationCost: number;
  /** Years from now until yearly income covers independence, education included. */
  timeToIndependence: number;
  /** 0 to 100: how well the best country suits this career and the user's preferences. */
  countryFit: number;
  bestCountry: CountryCode;
  breakdown: ScoreBreakdown;
  /** Short plain-language reasons, so a result is never a black box. */
  reasons: string[];
  /** Set by rerank(): the rank this career had before and how many places it moved (positive = up). */
  previousRank?: number;
  rankChange?: number;
}
