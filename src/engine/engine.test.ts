import { describe, expect, it } from "vitest";
import {
  OCCUPATIONS,
  analyseProfile,
  allowedCountries,
  recommendCareers,
  rankCareers,
  rerank,
  resolveWeights,
  type UserProfile,
} from "./index";
import {
  feasibilityScore,
  incomeAtYear,
  interestScore,
  normalisePriorities,
  skillScore,
  timeToIndependence,
} from "./rules";
import { getCountry } from "./countries";

const techProfile: UserProfile = {
  interests: ["tech", "analytical"],
  skills: { math: 5, communication: 2, creativity: 3, practical: 2, leadership: 2, focus: 5 },
  priorities: { income: 5, freedom: 4, stability: 3, prestige: 2, impact: 1 },
  constraints: { willingToMove: "anywhere", timeHorizonYears: 8, currentCountry: "NO" },
};

/** A profile with no strong pull, so the sliders have room to change the order. */
const openProfile: UserProfile = {
  interests: ["people", "business", "handson"],
  skills: { math: 3, communication: 3, creativity: 3, practical: 3, leadership: 3, focus: 3 },
  priorities: { income: 1, stability: 1, impact: 1, freedom: 1, prestige: 1, balance: 1 },
  constraints: { willingToMove: "anywhere", timeHorizonYears: 8, currentCountry: "NO" },
};

const rankOf = (matches: ReturnType<typeof recommendCareers>, isco: string) =>
  matches.find((m) => m.isco === isco)!.rank;

describe("output shape", () => {
  const result = recommendCareers(techProfile);

  it("ranks every occupation, best first, with scores from 0 to 100", () => {
    expect(result).toHaveLength(OCCUPATIONS.length);
    result.forEach((m, i) => {
      expect(m.rank).toBe(i + 1);
      expect(m.matchScore).toBeGreaterThanOrEqual(0);
      expect(m.matchScore).toBeLessThanOrEqual(100);
      if (i > 0) expect(m.matchScore).toBeLessThanOrEqual(result[i - 1]!.matchScore);
    });
  });

  it("returns every requested field", () => {
    const first = result[0]!;
    for (const key of [
      "matchScore",
      "incomeYear1",
      "incomeYear5",
      "incomeYear10",
      "educationCost",
      "timeToIndependence",
      "countryFit",
    ] as const) {
      expect(typeof first[key]).toBe("number");
    }
    expect(first.incomeYear1).toBeLessThanOrEqual(first.incomeYear5);
    expect(first.incomeYear5).toBeLessThanOrEqual(first.incomeYear10);
    expect(first.reasons.length).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    expect(recommendCareers(techProfile)).toEqual(recommendCareers(techProfile));
  });

  it("puts a maths and tech profile's software developer first", () => {
    expect(result[0]!.isco).toBe("2512");
  });
});

describe("rules", () => {
  const software = OCCUPATIONS.find((o) => o.isco === "2512")!;
  const electrician = OCCUPATIONS.find((o) => o.isco === "7411")!;
  const doctor = OCCUPATIONS.find((o) => o.isco === "2211")!;

  it("interests: full match scores 1, no match scores the floor, none given is neutral", () => {
    expect(interestScore(["tech", "analytical"], software)).toBeCloseTo(1);
    expect(interestScore(["nature"], software)).toBeCloseTo(0.1);
    expect(interestScore([], software)).toBe(0.5);
    expect(interestScore(["TECH "], software)).toBeGreaterThan(0.5);
  });

  it("skills: meeting the level scores 1 and each missing level costs 0.3", () => {
    const strong = {
      math: 5,
      communication: 5,
      creativity: 5,
      practical: 5,
      leadership: 5,
      focus: 5,
    };
    expect(skillScore(strong, software)).toBe(1);
    const oneShort = { ...strong, math: 2 }; // software asks for 3
    expect(skillScore(oneShort, software)).toBeLessThan(1);
    expect(skillScore(oneShort, software)).toBeGreaterThan(0.6);
  });

  it("priorities are normalised and default to equal", () => {
    const equal = normalisePriorities({});
    expect(Object.values(equal).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    const weighted = normalisePriorities({ income: 3, stability: 1, impact: -5 });
    expect(weighted.income).toBeCloseTo(0.75);
    expect(weighted.impact).toBe(0);
  });

  it("income is interpolated between years 1, 5 and 10 and scaled by country", () => {
    const de = getCountry("DE");
    const us = getCountry("US");
    expect(incomeAtYear(software, de, 1)).toBe(48000);
    expect(incomeAtYear(software, de, 5)).toBe(78000);
    expect(incomeAtYear(software, de, 10)).toBe(105000);
    expect(incomeAtYear(software, de, 3)).toBe(63000);
    expect(incomeAtYear(software, us, 1)).toBeCloseTo(48000 * 1.45);
  });

  it("a short education reaches independence before a long one", () => {
    const no = getCountry("NO");
    expect(timeToIndependence(electrician, no)).toBeLessThan(timeToIndependence(doctor, no));
  });

  it("feasibility is 1 inside the horizon and falls once past it", () => {
    expect(feasibilityScore(6, 8)).toBe(1);
    expect(feasibilityScore(12, 8)).toBeCloseTo(0.5);
    expect(feasibilityScore(40, 8)).toBe(0);
  });
});

describe("country constraints", () => {
  it("stay means only the current country", () => {
    const stay = {
      ...techProfile,
      constraints: { ...techProfile.constraints, willingToMove: "stay" as const },
    };
    expect(allowedCountries(stay.constraints)).toEqual(["NO"]);
    expect(recommendCareers(stay).every((m) => m.bestCountry === "NO")).toBe(true);
  });

  it("nearby stays inside the neighbour list", () => {
    const nearby = {
      ...techProfile,
      constraints: { ...techProfile.constraints, willingToMove: "nearby" as const },
    };
    const allowed = allowedCountries(nearby.constraints);
    expect(allowed).toEqual(["NO", "SE", "DK"]);
    expect(recommendCareers(nearby).every((m) => allowed.includes(m.bestCountry))).toBe(true);
  });

  it("anywhere can pick a higher-paying country", () => {
    const result = recommendCareers(techProfile);
    expect(result.some((m) => m.bestCountry !== "NO")).toBe(true);
  });
});

describe("preference sliders re-rank", () => {
  const analysis = analyseProfile(openProfile);

  it("weights always add up to 1", () => {
    for (const prefs of [
      { incomeFocus: 0, stayLocal: 0, shortEducation: 0 },
      { incomeFocus: 1, stayLocal: 1, shortEducation: 1 },
      { incomeFocus: 0.3, stayLocal: 0.6, shortEducation: 0.9 },
    ]) {
      const w = resolveWeights(prefs);
      expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    }
  });

  it("income focus moves high earners up", () => {
    const base = rankCareers(analysis, { incomeFocus: 0 });
    const rich = rankCareers(analysis, { incomeFocus: 1 });
    // Financial analyst (2413) pays far more than shop assistant (5223).
    expect(rankOf(rich, "2413")).toBeLessThanOrEqual(rankOf(base, "2413"));
    expect(rankOf(rich, "5223")).toBeGreaterThanOrEqual(rankOf(base, "5223"));
  });

  it("short education focus moves short routes up and long ones down", () => {
    const base = rankCareers(analysis, { shortEducation: 0 });
    const short = rankCareers(analysis, { shortEducation: 1 });
    expect(rankOf(short, "7411")).toBeLessThanOrEqual(rankOf(base, "7411")); // electrician, 2 years
    expect(rankOf(short, "2211")).toBeGreaterThanOrEqual(rankOf(base, "2211")); // doctor, 6 years
  });

  it("stay local pulls every career back to the current country", () => {
    const free = rankCareers(analysis, { stayLocal: 0 });
    const local = rankCareers(analysis, { stayLocal: 1 });
    expect(free.some((m) => m.bestCountry !== "NO")).toBe(true);
    expect(local.every((m) => m.bestCountry === "NO")).toBe(true);
  });

  it("rerank reports how far each career moved", () => {
    const before = rankCareers(analysis, {});
    const after = rerank(analysis, { incomeFocus: 1 }, before);
    for (const m of after) {
      expect(m.previousRank).toBe(before.find((b) => b.isco === m.isco)!.rank);
      expect(m.rankChange).toBe(m.previousRank! - m.rank);
    }
    expect(after.some((m) => m.rankChange !== 0)).toBe(true);
  });

  it("clamps out-of-range slider values instead of failing", () => {
    expect(() =>
      rankCareers(analysis, { incomeFocus: 7, stayLocal: -3, shortEducation: Number.NaN }),
    ).not.toThrow();
  });
});

describe("thin profiles", () => {
  it("handles a profile with no interests or priorities", () => {
    const bare: UserProfile = {
      interests: [],
      skills: { math: 3, communication: 3, creativity: 3, practical: 3, leadership: 3, focus: 3 },
      priorities: {},
      constraints: { willingToMove: "stay", timeHorizonYears: 6, currentCountry: "DE" },
    };
    const result = recommendCareers(bare);
    expect(result).toHaveLength(OCCUPATIONS.length);
    expect(result.every((m) => Number.isFinite(m.matchScore))).toBe(true);
  });
});
