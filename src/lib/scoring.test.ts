import { describe, expect, it } from "vitest";
import { PATHS } from "./data";
import { allowedCountries, countryResult, DEFAULT_PREFS, rankPaths, type Profile } from "./scoring";

const profile: Profile = {
  interests: ["tech", "analytical"],
  skills: { math: 5, communication: 2, creativity: 3, practical: 2, leadership: 2, focus: 5 },
  values: ["income", "freedom", "stability", "prestige", "impact"],
  maxEduYears: 4, budget: "medium", mobility: "anywhere", home: "NO", horizon: "balanced", situation: "school",
};

describe("scoring", () => {
  it("ranks a tech/maths profile with software engineer first", () => {
    expect(rankPaths(profile, DEFAULT_PREFS)[0]!.path.id).toBe("software-engineer");
  });
  it("staying home restricts countries to the home country", () => {
    expect(allowedCountries(profile, { ...DEFAULT_PREFS, stayHome: true })).toEqual(["NO"]);
  });
  it("scales income by country multiplier", () => {
    const se = PATHS.find((p) => p.id === "software-engineer")!;
    expect(countryResult(se, "US").income[0]).toBe(70000);
  });
});
