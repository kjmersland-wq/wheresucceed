import {
  COUNTRIES,
  DEFAULT_PREFERENCES,
  OCCUPATIONS,
  PRIORITY_KEYS,
  SKILL_KEYS,
  analyseProfile,
  rankCareers,
  type PreferenceWeights,
  type UserProfile,
} from "@/engine";
import { normalisePriorities } from "@/engine/rules";
import type { ExplainRequest } from "./contract";

/**
 * The only thing the model ever sees: the profile the person gave, their slider
 * settings, and what the scoring engine already worked out for one career.
 * Nothing here comes from the model, the web or free text.
 */
export interface ExplainFacts {
  profile: {
    interests: string[];
    skills: Record<string, number>;
    /** Share of the person's priorities each one holds, in percent, adding up to about 100. */
    priorityPercent: Record<string, number>;
    constraints: {
      willingToMove: string;
      timeHorizonYears: number;
      currentCountry: string;
    };
  };
  /** The three sliders, in percent. */
  preferencesPercent: { incomeFocus: number; stayLocal: number; shortEducation: number; remoteFriendly: number };
  career: {
    title: string;
    isco: string;
    rank: number;
    outOf: number;
    matchScore: number;
    /** Every component of the score, 0 to 100. */
    breakdown: Record<string, number>;
    incomeEURPerYear: { year1: number; year5: number; year10: number };
    educationCostEUR: number;
    educationYears: number;
    timeToIndependenceYears: number;
    countryFit: number;
    bestCountry: string;
    reasons: string[];
  };
  requirements: {
    /** For each skill the job asks for: the level it asks for and the level the person rated. */
    skills: { skill: string; requiredLevel: number; yourLevel: number }[];
    interestsMatched: string[];
    interestsTheJobUses: string[];
  };
}

const pct = (n: number) => Math.round(n * 100);

/** Rebuilds the engine's input from the validated request (no `undefined` fields). */
export function toEngineProfile(profile: ExplainRequest["profile"]): UserProfile {
  const priorities: UserProfile["priorities"] = {};
  for (const key of PRIORITY_KEYS) {
    const value = profile.priorities[key];
    if (value !== undefined) priorities[key] = value;
  }
  return {
    interests: profile.interests,
    skills: profile.skills,
    priorities,
    constraints: profile.constraints,
  };
}

/** Runs the engine and collects the facts for one career, or null if the ISCO code is unknown. */
export function buildFacts(
  request: Pick<ExplainRequest, "isco" | "profile" | "prefs">,
): ExplainFacts | null {
  const occupation = OCCUPATIONS.find((o) => o.isco === request.isco);
  if (!occupation) return null;

  const profile = toEngineProfile(request.profile);
  const prefs: PreferenceWeights = { ...DEFAULT_PREFERENCES, ...request.prefs };
  const analysis = analyseProfile(profile);
  const ranking = rankCareers(analysis, prefs);
  const match = ranking.find((m) => m.isco === request.isco);
  const career = analysis.careers.find((c) => c.occupation.isco === request.isco);
  if (!match || !career) return null;

  const shares = normalisePriorities(profile.priorities);
  const country = COUNTRIES.find((c) => c.code === match.bestCountry);

  return {
    profile: {
      interests: [...profile.interests],
      skills: { ...profile.skills },
      priorityPercent: Object.fromEntries(PRIORITY_KEYS.map((key) => [key, pct(shares[key])])),
      constraints: {
        willingToMove: profile.constraints.willingToMove,
        timeHorizonYears: profile.constraints.timeHorizonYears,
        currentCountry: profile.constraints.currentCountry,
      },
    },
    preferencesPercent: {
      incomeFocus: pct(prefs.incomeFocus),
      stayLocal: pct(prefs.stayLocal),
      shortEducation: pct(prefs.shortEducation),
      remoteFriendly: pct(prefs.remoteFriendly),
    },
    career: {
      title: match.title,
      isco: match.isco,
      rank: match.rank,
      outOf: ranking.length,
      matchScore: match.matchScore,
      breakdown: { ...match.breakdown },
      incomeEURPerYear: {
        year1: match.incomeYear1,
        year5: match.incomeYear5,
        year10: match.incomeYear10,
      },
      educationCostEUR: match.educationCost,
      educationYears: occupation.educationYears,
      timeToIndependenceYears: match.timeToIndependence,
      countryFit: match.countryFit,
      bestCountry: country?.name ?? match.bestCountry,
      reasons: [...match.reasons],
    },
    requirements: {
      skills: SKILL_KEYS.flatMap((skill) => {
        const requirement = occupation.skills[skill];
        return requirement
          ? [{ skill, requiredLevel: requirement[0], yourLevel: profile.skills[skill] }]
          : [];
      }),
      interestsMatched: [...career.matchedInterests],
      interestsTheJobUses: Object.keys(occupation.interests),
    },
  };
}
