import { useSyncExternalStore } from "react";

/**
 * Whether Premium is switched on for this device. The browser only remembers the
 * access code so it can show the Premium controls; the server checks the code again
 * on every request, so this flag unlocks nothing by itself.
 */
const KEY = "wheresucceed:premium";

type PremiumState = { active: boolean; code: string | null };
const OFF: PremiumState = { active: false, code: null };

let cache: PremiumState | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function read(): PremiumState {
  if (cache) return cache;
  let code: string | null = null;
  try {
    code = localStorage.getItem(KEY);
  } catch {
    /* storage blocked: Premium simply stays off */
  }
  cache = code ? { active: true, code } : OFF;
  return cache;
}

export function getPremiumCode(): string | null {
  return read().code;
}

export function usePremium(): PremiumState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
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
    read,
    () => OFF,
  );
}

export function deactivatePremium() {
  cache = OFF;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
  notify();
}

export type ActivateResult = "ok" | "invalid" | "rate_limited" | "error";

/** Asks the server whether the code is valid and, if so, switches Premium on for this device. */
export async function activatePremium(code: string): Promise<ActivateResult> {
  const trimmed = code.trim();
  if (!trimmed) return "invalid";
  try {
    const response = await fetch("/api/premium", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: trimmed }),
    });
    if (response.status === 429) return "rate_limited";
    if (!response.ok) return "error";
    const data = (await response.json()) as { valid?: boolean };
    if (!data.valid) return "invalid";
    try {
      localStorage.setItem(KEY, trimmed);
    } catch {
      /* still on for this visit */
    }
    cache = { active: true, code: trimmed };
    notify();
    return "ok";
  } catch {
    return "error";
  }
}
