import type { PreferenceWeights } from "./types";

/**
 * How much each component counts in the final match score.
 *
 * The first five always count. "income", "shortEducation" and "remote" start at zero and
 * only switch on when the user moves the matching slider. The weights are
 * normalised to add up to 1, so matchScore stays between 0 and 100.
 */
export interface ComponentWeights {
  interests: number;
  skills: number;
  values: number;
  feasibility: number;
  countryFit: number;
  income: number;
  shortEducation: number;
  remote: number;
}

export const BASE_WEIGHTS: ComponentWeights = {
  interests: 0.28,
  skills: 0.24,
  values: 0.2,
  feasibility: 0.12,
  countryFit: 0.16,
  income: 0,
  shortEducation: 0,
  remote: 0,
};

/** Weight added to a component when its slider is at 1 (before normalising). */
export const SLIDER_STRENGTH = {
  income: 0.25,
  shortEducation: 0.2,
  remote: 0.2,
} as const;

export const DEFAULT_PREFERENCES: PreferenceWeights = {
  incomeFocus: 0,
  stayLocal: 0,
  shortEducation: 0,
  remoteFriendly: 0,
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

/** Keeps slider values inside 0 to 1 so bad input can never break the ranking. */
export function cleanPreferences(prefs: Partial<PreferenceWeights> = {}): PreferenceWeights {
  return {
    incomeFocus: clamp01(prefs.incomeFocus ?? 0),
    stayLocal: clamp01(prefs.stayLocal ?? 0),
    shortEducation: clamp01(prefs.shortEducation ?? 0),
    remoteFriendly: clamp01(prefs.remoteFriendly ?? 0),
  };
}

/**
 * Component weights for a set of sliders:
 *   incomeFocus    -> raises the income weight
 *   shortEducation -> raises the short-education weight
 *   remoteFriendly -> raises the remote weight
 *   stayLocal      -> does not change these weights; it lowers the country fit of
 *                     other countries (see moveFactor in rules.ts)
 */
export function resolveWeights(prefs: PreferenceWeights): ComponentWeights {
  const p = cleanPreferences(prefs);
  const raw: ComponentWeights = {
    ...BASE_WEIGHTS,
    income: BASE_WEIGHTS.income + SLIDER_STRENGTH.income * p.incomeFocus,
    shortEducation: BASE_WEIGHTS.shortEducation + SLIDER_STRENGTH.shortEducation * p.shortEducation,
    remote: BASE_WEIGHTS.remote + SLIDER_STRENGTH.remote * p.remoteFriendly,
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  return {
    interests: raw.interests / total,
    skills: raw.skills / total,
    values: raw.values / total,
    feasibility: raw.feasibility / total,
    countryFit: raw.countryFit / total,
    income: raw.income / total,
    shortEducation: raw.shortEducation / total,
    remote: raw.remote / total,
  };
}
