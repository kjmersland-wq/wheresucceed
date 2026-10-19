import { COUNTRIES, NEARBY, getCountry } from "./countries";
import { OCCUPATIONS } from "./occupations";
import {
  baseCountryFit,
  educationCost,
  feasibilityScore,
  incomeAtYear,
  incomeScore,
  interestScore,
  matchedInterests,
  moveFactor,
  shortEducationScore,
  skillGaps,
  skillScore,
  timeToIndependence,
  valuesScore,
} from "./rules";
import { DEFAULT_PREFERENCES, cleanPreferences, resolveWeights } from "./weights";
import type {
  CareerMatch,
  Constraints,
  CountryCode,
  Occupation,
  PreferenceWeights,
  UserProfile,
} from "./types";

export * from "./types";
export { COUNTRIES, NEARBY } from "./countries";
export { OCCUPATIONS } from "./occupations";
export { RULES } from "./rules";
export { BASE_WEIGHTS, SLIDER_STRENGTH, DEFAULT_PREFERENCES, resolveWeights } from "./weights";

/* ---------- step 1: analyse the profile (the work that depends only on the profile) ---------- */

/** How one occupation looks in one country: everything that does not depend on the sliders. */
export interface CountryOption {
  country: CountryCode;
  /** Demand and income, before location preferences. 0 to 1. */
  baseFit: number;
  /** 1 when independence comes within the user's time horizon. 0 to 1. */
  feasibility: number;
  incomeYear1: number;
  incomeYear5: number;
  incomeYear10: number;
  educationCost: number;
  timeToIndependence: number;
  /** 0 to 1. */
  incomeScore: number;
}

export interface CareerAnalysis {
  occupation: Occupation;
  /** 0 to 1 each. */
  interests: number;
  skills: number;
  values: number;
  shortEducation: number;
  matchedInterests: string[];
  skillGaps: ReturnType<typeof skillGaps>;
  options: CountryOption[];
}

export interface ProfileAnalysis {
  home: CountryCode;
  horizonYears: number;
  careers: CareerAnalysis[];
}

/** The countries this user is willing to consider. The current country is always included. */
export function allowedCountries(constraints: Constraints): CountryCode[] {
  const home = constraints.currentCountry;
  switch (constraints.willingToMove) {
    case "stay":
      return [home];
    case "nearby":
      return [home, ...NEARBY[home]];
    case "anywhere":
      return COUNTRIES.map((c) => c.code);
  }
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/**
 * Scores everything that depends only on the profile. Call this once, then call
 * rankCareers or rerank as often as you like when the sliders move.
 */
export function analyseProfile(
  profile: UserProfile,
  occupations: readonly Occupation[] = OCCUPATIONS,
): ProfileAnalysis {
  const codes = allowedCountries(profile.constraints);

  const careers = occupations.map((occupation): CareerAnalysis => {
    const options = codes.map((code): CountryOption => {
      const country = getCountry(code);
      const years = timeToIndependence(occupation, country);
      return {
        country: code,
        baseFit: baseCountryFit(occupation, country),
        feasibility: feasibilityScore(years, profile.constraints.timeHorizonYears),
        incomeYear1: roundTo(incomeAtYear(occupation, country, 1), 500),
        incomeYear5: roundTo(incomeAtYear(occupation, country, 5), 500),
        incomeYear10: roundTo(incomeAtYear(occupation, country, 10), 500),
        educationCost: roundTo(educationCost(occupation, country), 500),
        timeToIndependence: years,
        incomeScore: incomeScore(occupation, country),
      };
    });

    return {
      occupation,
      interests: interestScore(profile.interests, occupation),
      skills: skillScore(profile.skills, occupation),
      values: valuesScore(profile.priorities, occupation),
      shortEducation: shortEducationScore(occupation),
      matchedInterests: matchedInterests(profile.interests, occupation),
      skillGaps: skillGaps(profile.skills, occupation),
      options,
    };
  });

  return {
    home: profile.constraints.currentCountry,
    horizonYears: profile.constraints.timeHorizonYears,
    careers,
  };
}

/* ---------- step 2: rank (cheap, depends on the sliders) ---------- */

const pct = (n: number) => Math.round(n * 100);

/**
 * Ranks careers for a set of sliders. Best country per career is the one with the
 * highest fit after the stay-local penalty; a tie goes to the current country.
 */
export function rankCareers(
  analysis: ProfileAnalysis,
  prefs: Partial<PreferenceWeights> = DEFAULT_PREFERENCES,
): CareerMatch[] {
  const sliders = cleanPreferences(prefs);
  const weights = resolveWeights(sliders);

  const matches = analysis.careers.map((career): Omit<CareerMatch, "rank"> => {
    const adjusted = career.options.map((option) => ({
      option,
      fit: option.baseFit * moveFactor(option.country === analysis.home, sliders.stayLocal),
    }));
    // Highest fit wins; on a tie prefer the current country, then the first listed.
    const best = adjusted.reduce((a, b) =>
      b.fit > a.fit || (b.fit === a.fit && b.option.country === analysis.home) ? b : a,
    );
    const { option } = best;

    const parts = {
      interests: career.interests,
      skills: career.skills,
      values: career.values,
      feasibility: option.feasibility,
      countryFit: best.fit,
      income: option.incomeScore,
      shortEducation: career.shortEducation,
    };

    const total =
      parts.interests * weights.interests +
      parts.skills * weights.skills +
      parts.values * weights.values +
      parts.feasibility * weights.feasibility +
      parts.countryFit * weights.countryFit +
      parts.income * weights.income +
      parts.shortEducation * weights.shortEducation;

    const reasons: string[] = [];
    if (career.matchedInterests.length > 0) {
      reasons.push(`Matches your interests: ${career.matchedInterests.join(", ")}`);
    }
    for (const gap of career.skillGaps.slice(0, 2)) {
      reasons.push(
        `Skill gap in ${gap.skill}: the job asks for ${gap.required}, you rated ${gap.have}`,
      );
    }
    reasons.push(
      option.timeToIndependence <= analysis.horizonYears
        ? `Independence in about ${option.timeToIndependence} years, within your ${analysis.horizonYears}-year horizon`
        : `Independence in about ${option.timeToIndependence} years, beyond your ${analysis.horizonYears}-year horizon`,
    );
    reasons.push(`Best fit in ${getCountry(option.country).name} (${pct(best.fit)}% country fit)`);

    return {
      isco: career.occupation.isco,
      title: career.occupation.title,
      iscoGroup: career.occupation.iscoGroup,
      matchScore: Math.round(100 * total),
      incomeYear1: option.incomeYear1,
      incomeYear5: option.incomeYear5,
      incomeYear10: option.incomeYear10,
      educationCost: option.educationCost,
      timeToIndependence: option.timeToIndependence,
      countryFit: pct(best.fit),
      bestCountry: option.country,
      breakdown: {
        interests: pct(parts.interests),
        skills: pct(parts.skills),
        values: pct(parts.values),
        feasibility: pct(parts.feasibility),
        countryFit: pct(parts.countryFit),
        income: pct(parts.income),
        shortEducation: pct(parts.shortEducation),
      },
      reasons,
    };
  });

  // Highest score first; ties by ISCO code so the order never wobbles between runs.
  return matches
    .sort((a, b) => b.matchScore - a.matchScore || a.isco.localeCompare(b.isco))
    .map((match, index) => ({ ...match, rank: index + 1 }));
}

/** One call from profile to ranked careers. */
export function recommendCareers(
  profile: UserProfile,
  prefs: Partial<PreferenceWeights> = DEFAULT_PREFERENCES,
  occupations: readonly Occupation[] = OCCUPATIONS,
): CareerMatch[] {
  return rankCareers(analyseProfile(profile, occupations), prefs);
}

/**
 * Re-ranks after the user moves a slider. Pass the analysis from analyseProfile
 * and, if you want movement arrows, the ranking that was on screen before.
 * Each row then carries previousRank and rankChange (positive = moved up).
 */
export function rerank(
  analysis: ProfileAnalysis,
  prefs: Partial<PreferenceWeights>,
  previous: readonly CareerMatch[] = [],
): CareerMatch[] {
  const before = new Map(previous.map((match) => [match.isco, match.rank]));
  return rankCareers(analysis, prefs).map((match) => {
    const was = before.get(match.isco);
    return was === undefined
      ? match
      : { ...match, previousRank: was, rankChange: was - match.rank };
  });
}
