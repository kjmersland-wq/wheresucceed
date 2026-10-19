import { useSyncExternalStore } from "react";
import { DEFAULT_PREFERENCES, recommendCareers } from "@/engine";
import { COUNTRIES, INTERESTS, SKILLS, VALUES } from "./data";
import { toUserProfile } from "./profile-adapter";
import { DEFAULT_PREFS, type Prefs, type Profile } from "./scoring";

/**
 * The user's saved mapping, kept on this device in localStorage.
 *
 * Everything that touches storage lives in this file, so moving to an account
 * (for example Supabase) later means changing this module and nothing else.
 */

/** One saved moment: the top paths at the time and what changed in the mapping. */
export type ThreadEntry = { date: string; top: { id: string; score: number }[]; note: string };
export type AppState = {
  profile: Profile | null;
  prefs: Prefs;
  thread: ThreadEntry[];
  /** When the mapping was last saved, ISO date. */
  updatedAt: string | null;
};

/** Same key as the first version, so anything already saved keeps loading. */
const KEY = "wheresucceed:v1";
/** Oldest entries are dropped beyond this, so storage never grows without limit. */
const MAX_THREAD = 30;

const EMPTY: AppState = { profile: null, prefs: DEFAULT_PREFS, thread: [], updatedAt: null };

/* ---------- reading: never trust what is in storage ---------- */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): v is T =>
  typeof v === "string" && (allowed as readonly string[]).includes(v);
const clamp = (n: unknown, min: number, max: number, fallback: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;

/** Returns a valid Profile, or null if anything essential is missing or malformed. */
export function sanitiseProfile(raw: unknown): Profile | null {
  if (!isRecord(raw)) return null;
  const interestIds = INTERESTS.map((i) => i.id);
  const skillIds = SKILLS.map((s) => s.id);
  const valueIds = VALUES.map((v) => v.id);

  if (!Array.isArray(raw["interests"]) || !raw["interests"].every((i) => oneOf(i, interestIds)))
    return null;
  const rawSkills = raw["skills"];
  if (!isRecord(rawSkills)) return null;
  const values = raw["values"];
  if (
    !Array.isArray(values) ||
    values.length !== valueIds.length ||
    !valueIds.every((v) => values.includes(v))
  ) {
    return null;
  }
  const { mobility, home, horizon, situation, budget } = raw;
  if (
    !oneOf(mobility, ["stay", "region", "anywhere"] as const) ||
    !oneOf(horizon, ["fast", "balanced", "long"] as const) ||
    !oneOf(situation, ["school", "student", "working", "searching"] as const) ||
    !oneOf(budget, ["low", "medium", "high"] as const) ||
    !oneOf(
      home,
      COUNTRIES.map((c) => c.code),
    )
  ) {
    return null;
  }

  const skills = Object.fromEntries(
    skillIds.map((id) => [id, clamp(rawSkills[id], 0, 5, 0)]),
  ) as Profile["skills"];
  return {
    interests: raw["interests"] as Profile["interests"],
    skills,
    values: values as Profile["values"],
    maxEduYears: clamp(raw["maxEduYears"], 0, 7, 4),
    budget,
    mobility,
    home,
    horizon,
    situation,
  };
}

function sanitisePrefs(raw: unknown): Prefs {
  if (!isRecord(raw)) return DEFAULT_PREFS;
  return {
    income: clamp(raw["income"], 0, 100, DEFAULT_PREFS.income),
    shortEdu: clamp(raw["shortEdu"], 0, 100, DEFAULT_PREFS.shortEdu),
    remote: clamp(raw["remote"], 0, 100, DEFAULT_PREFS.remote),
    stayHome: typeof raw["stayHome"] === "boolean" ? raw["stayHome"] : DEFAULT_PREFS.stayHome,
  };
}

function sanitiseThread(raw: unknown): ThreadEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: ThreadEntry[] = [];
  for (const item of raw) {
    if (!isRecord(item) || typeof item["date"] !== "string" || typeof item["note"] !== "string")
      continue;
    const top = Array.isArray(item["top"])
      ? item["top"].flatMap((t: unknown) =>
          isRecord(t) && typeof t["id"] === "string" && typeof t["score"] === "number"
            ? [{ id: t["id"], score: t["score"] }]
            : [],
        )
      : [];
    entries.push({ date: item["date"], note: item["note"], top });
  }
  return entries.slice(-MAX_THREAD);
}

/** Turns whatever is in storage into a valid state. Bad or missing data gives an empty state, never an error. */
export function parseStored(raw: string | null): AppState {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return EMPTY;
    return {
      profile: sanitiseProfile(data["profile"]),
      prefs: sanitisePrefs(data["prefs"]),
      thread: sanitiseThread(data["thread"]),
      updatedAt: typeof data["updatedAt"] === "string" ? data["updatedAt"] : null,
    };
  } catch {
    return EMPTY;
  }
}

/* ---------- the store ---------- */

let cache: AppState | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function read(): AppState {
  if (cache) return cache;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* storage blocked: start empty and keep the session in memory */
  }
  cache = parseStored(raw);
  return cache;
}

/** The current state, read outside React. */
export function getState(): AppState {
  return read();
}

export function setState(fn: (s: AppState) => AppState) {
  cache = fn(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* private mode or full storage: the change still applies until the tab closes */
  }
  notify();
}

/** Returns null during SSR / before hydration. */
export function useAppState(): AppState | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      // Another tab saved a change: reload from storage.
      const onStorage = (event: StorageEvent) => {
        if (event.key === KEY || event.key === null) {
          cache = null;
          notify();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    () => read(),
    () => null,
  );
}

/* ---------- saving a mapping ---------- */

const SECTION_LABELS = {
  interests: "interests",
  skills: "skills",
  values: "priorities",
  situation: "situation",
} as const;

/** Which parts of the mapping differ, as plain words, for the thread note. */
export function changedSections(before: Profile, after: Profile): string[] {
  const changed: string[] = [];
  const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && a.every((x) => b.includes(x));
  if (!sameSet(before.interests, after.interests)) changed.push(SECTION_LABELS.interests);
  if (SKILLS.some((s) => before.skills[s.id] !== after.skills[s.id]))
    changed.push(SECTION_LABELS.skills);
  if (before.values.join() !== after.values.join()) changed.push(SECTION_LABELS.values);
  const keys = ["situation", "home", "mobility", "horizon", "maxEduYears", "budget"] as const;
  if (keys.some((k) => before[k] !== after[k])) changed.push(SECTION_LABELS.situation);
  return changed;
}

/**
 * Saves the mapping and adds a snapshot to the thread: the top three paths for it
 * (scored by the engine) and, when it is an edit, what changed.
 */
export function saveMapping(profile: Profile) {
  setState((state) => {
    const top = recommendCareers(toUserProfile(profile), DEFAULT_PREFERENCES)
      .slice(0, 3)
      .map((m) => ({ id: m.isco, score: m.matchScore }));
    const changes = state.profile ? changedSections(state.profile, profile) : [];
    const note = !state.profile
      ? "First mapping"
      : changes.length > 0
        ? `Mapping updated: ${changes.join(", ")}`
        : "Mapping reviewed, no changes";
    const date = new Date().toISOString();
    return {
      ...state,
      profile,
      updatedAt: date,
      thread: [...state.thread, { date, top, note }].slice(-MAX_THREAD),
    };
  });
}
