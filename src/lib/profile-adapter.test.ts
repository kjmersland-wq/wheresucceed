import { describe, expect, it } from "vitest";
import { recommendCareers } from "@/engine";
import { SAMPLE_PROFILE, toPreferenceWeights, toUserProfile } from "./profile-adapter";
import type { Profile } from "./scoring";

const saved: Profile = {
  interests: ["tech", "analytical"],
  skills: { math: 5, communication: 2, creativity: 3, practical: 2, leadership: 2, focus: 5 },
  values: ["income", "freedom", "stability", "prestige", "impact"],
  maxEduYears: 4,
  budget: "medium",
  mobility: "region",
  home: "NO",
  horizon: "fast",
  situation: "school",
};

describe("toUserProfile", () => {
  it("turns the ranked values into descending weights", () => {
    const profile = toUserProfile(saved);
    expect(profile.priorities).toEqual({
      income: 5,
      freedom: 4,
      stability: 3,
      prestige: 2,
      impact: 1,
    });
  });

  it("maps mobility and horizon to the engine's constraints", () => {
    const profile = toUserProfile(saved);
    expect(profile.constraints).toEqual({
      willingToMove: "nearby",
      timeHorizonYears: 5,
      currentCountry: "NO",
    });
    expect(
      toUserProfile({ ...saved, mobility: "stay", horizon: "long" }).constraints,
    ).toMatchObject({
      willingToMove: "stay",
      timeHorizonYears: 12,
    });
  });

  it("gives the engine something it can rank", () => {
    expect(recommendCareers(toUserProfile(saved))[0]!.title).toBe("Software developer");
    expect(recommendCareers(SAMPLE_PROFILE).length).toBeGreaterThanOrEqual(6);
  });
});

describe("toPreferenceWeights", () => {
  it("scales the saved sliders to 0-1 and turns the home switch into stay-local", () => {
    expect(toPreferenceWeights({ income: 50, shortEdu: 100, remote: 30, stayHome: true })).toEqual({
      incomeFocus: 0.5,
      shortEducation: 1,
      remoteFriendly: 0.3,
      stayLocal: 1,
    });
    expect(toPreferenceWeights({ income: 0, shortEdu: 0, remote: 0, stayHome: false }).stayLocal).toBe(0);
  });
});
