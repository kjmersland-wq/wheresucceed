import type { PreferenceWeights, PriorityWeights, UserProfile } from "@/engine";
import type { Prefs, Profile } from "@/lib/scoring";

/** How many years each "horizon" answer in the mapping stands for. */
const HORIZON_YEARS = { fast: 5, balanced: 8, long: 12 } as const;
const MOBILITY = { stay: "stay", region: "nearby", anywhere: "anywhere" } as const;

/**
 * Turns the profile saved by the mapping (src/lib/scoring.ts) into the input the
 * scoring engine expects. The ranked values list becomes weights: first place counts
 * most, last place least.
 */
export function toUserProfile(p: Profile): UserProfile {
  const priorities: PriorityWeights = {};
  p.values.forEach((value, index) => {
    priorities[value] = p.values.length - index;
  });
  return {
    interests: p.interests,
    skills: p.skills,
    priorities,
    constraints: {
      willingToMove: MOBILITY[p.mobility],
      timeHorizonYears: HORIZON_YEARS[p.horizon],
      currentCountry: p.home,
    },
  };
}

/**
 * Turns the saved slider settings (0-100, plus the stay-at-home switch) into the engine's
 * slider weights (0-1). The switch counts as the stay-local slider at its maximum.
 */
export function toPreferenceWeights(prefs: Prefs): PreferenceWeights {
  return {
    incomeFocus: prefs.income / 100,
    shortEducation: prefs.shortEdu / 100,
    remoteFriendly: prefs.remote / 100,
    stayLocal: prefs.stayHome ? 1 : 0,
  };
}

/** Shown on the dashboard until someone has completed their own mapping. */
export const SAMPLE_PROFILE: UserProfile = {
  interests: ["tech", "analytical", "creative"],
  skills: { math: 4, communication: 3, creativity: 4, practical: 2, leadership: 3, focus: 4 },
  priorities: { income: 4, freedom: 5, impact: 3, stability: 2, prestige: 1 },
  constraints: { willingToMove: "anywhere", timeHorizonYears: 8, currentCountry: "NO" },
};
