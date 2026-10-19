import { COUNTRIES, PATHS, type CountryCode, type Interest, type Path, type Skill, type Value } from "./data";

export type Profile = {
  interests: Interest[];
  skills: Record<Skill, number>; // 1-5
  values: Value[]; // ranked, most important first
  maxEduYears: number; // 0-7
  budget: "low" | "medium" | "high";
  mobility: "stay" | "region" | "anywhere";
  home: CountryCode;
  horizon: "fast" | "balanced" | "long";
  situation: "school" | "student" | "working" | "searching";
};

export type Prefs = {
  income: number; // 0-100 weight
  shortEdu: number;
  remote: number;
  stayHome: boolean;
};

export const DEFAULT_PREFS: Prefs = { income: 50, shortEdu: 50, remote: 30, stayHome: false };

export type CountryResult = {
  code: CountryCode;
  income: [number, number, number];
  eduCost: number;
  demand: number;
};

export type PathResult = {
  path: Path;
  score: number;
  breakdown: { interests: number; skills: number; values: number; practical: number };
  best: CountryResult;
  countries: CountryResult[];
  yearsToIndependence: number;
};

const BUDGET_CAP = { low: 8000, medium: 20000, high: Infinity };
const NORDIC_EU: CountryCode[] = ["NO", "SE", "DE", "NL"];

export function allowedCountries(p: Profile, prefs: Prefs): CountryCode[] {
  if (prefs.stayHome || p.mobility === "stay") return [p.home];
  if (p.mobility === "region") {
    const region = p.home === "US" ? ["US"] : p.home === "UK" ? ["UK", ...NORDIC_EU] : NORDIC_EU;
    return Array.from(new Set([p.home, ...region])) as CountryCode[];
  }
  return COUNTRIES.map((c) => c.code);
}

export function countryResult(path: Path, code: CountryCode): CountryResult {
  const c = COUNTRIES.find((x) => x.code === code)!;
  return {
    code,
    income: path.income.map((v) => Math.round((v * c.incomeMult) / 1000) * 1000) as [number, number, number],
    eduCost: Math.round((path.eduCostBase * c.costMult) / 500) * 500,
    demand: path.demand[code] ?? 0.5,
  };
}

/** Years of education plus time until year-1 income covers independence (~35k EUR). */
export function yearsToIndependence(path: Path, cr: CountryResult): number {
  const [y1, y5] = cr.income;
  if (y1 >= 35000) return path.eduYears + 1;
  const perYear = (y5 - y1) / 4;
  const extra = perYear > 0 ? Math.ceil((35000 - y1) / perYear) : 5;
  return path.eduYears + 1 + Math.min(extra, 6);
}

export function scorePath(path: Path, p: Profile, prefs: Prefs): PathResult {
  // Interests: share of the path's interests the user picked, softened
  const hits = path.interests.filter((i) => p.interests.includes(i)).length;
  const interests = hits === 0 ? 0.15 : Math.min(1, 0.35 + (hits / path.interests.length) * 0.75);

  // Skills: weighted average of user rating on what the path needs
  let sw = 0, ss = 0;
  for (const [k, w] of Object.entries(path.skills) as [Skill, number][]) {
    sw += w;
    ss += w * ((p.skills[k] - 1) / 4);
  }
  const skills = sw ? ss / sw : 0.5;

  // Values: rank-weighted (5,4,3,2,1)
  let vw = 0, vs = 0;
  p.values.forEach((v, i) => {
    const w = p.values.length - i;
    vw += w;
    vs += w * (path.values[v] ?? 0.3);
  });
  const values = vw ? vs / vw : 0.5;

  // Countries
  const codes = allowedCountries(p, prefs);
  const countries = codes.map((c) => countryResult(path, c));
  const best = [...countries].sort((a, b) => b.income[1] * (0.6 + b.demand) - a.income[1] * (0.6 + a.demand))[0];

  // Practical constraints
  let practical = 1;
  if (path.eduYears > p.maxEduYears) practical -= 0.18 * (path.eduYears - p.maxEduYears);
  if (best.eduCost > BUDGET_CAP[p.budget]) practical -= 0.25;
  if (p.horizon === "fast" && path.eduYears > 3) practical -= 0.15;
  if (p.horizon === "long" && path.eduYears >= 5) practical += 0.05;
  practical = Math.max(0, Math.min(1, practical)) * (0.7 + 0.3 * best.demand);

  // Preference modifiers
  const incomeNorm = Math.min(1, best.income[1] / 100000);
  const eduNorm = 1 - Math.min(1, path.eduYears / 6);
  const wI = prefs.income / 100, wE = prefs.shortEdu / 100, wR = prefs.remote / 100;
  const prefScore = (wI * incomeNorm + wE * eduNorm + wR * path.remote) / Math.max(0.0001, wI + wE + wR);
  const prefWeight = (wI + wE + wR) / 3; // 0..1

  const base = interests * 0.32 + skills * 0.24 + values * 0.22 + practical * 0.22;
  const blended = base * (1 - 0.35 * prefWeight) + prefScore * 0.35 * prefWeight;
  const score = Math.round(Math.max(0, Math.min(1, blended)) * 100);

  return { path, score, breakdown: { interests, skills, values, practical }, best, countries, yearsToIndependence: yearsToIndependence(path, best) };
}

export function rankPaths(p: Profile, prefs: Prefs): PathResult[] {
  return PATHS.map((path) => scorePath(path, p, prefs)).sort((a, b) => b.score - a.score);
}

export const fmtEUR = (n: number) => (n >= 1000 ? `€${Math.round(n / 1000)}k` : `€${n}`);
