import { useSyncExternalStore } from "react";
import { DEFAULT_PREFS, type Prefs, type Profile } from "./scoring";

export type ThreadEntry = { date: string; top: { id: string; score: number }[]; note: string };
export type AppState = { profile: Profile | null; prefs: Prefs; thread: ThreadEntry[] };

const KEY = "wheresucceed:v1";
const EMPTY: AppState = { profile: null, prefs: DEFAULT_PREFS, thread: [] };
let cache: AppState | null = null;
const listeners = new Set<() => void>();

function read(): AppState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

export function setState(fn: (s: AppState) => AppState) {
  cache = fn(read());
  localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

/** Returns null during SSR / before hydration. */
export function useAppState(): AppState | null {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => read(),
    () => null,
  );
}
