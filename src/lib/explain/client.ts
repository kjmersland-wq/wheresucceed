import type { PreferenceWeights, UserProfile } from "@/engine";

export type ExplainError =
  "premium_required" | "rate_limited" | "unavailable" | "unusable" | "declined" | "failed";
export type ExplainOutcome = { ok: true; text: string } | { ok: false; error: ExplainError };

/** Calls the explain endpoint. The server works out every number itself from this profile. */
export async function requestExplanation(input: {
  code: string;
  isco: string;
  profile: UserProfile;
  prefs: PreferenceWeights;
}): Promise<ExplainOutcome> {
  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      const data = (await response.json()) as { explanation?: string };
      return data.explanation
        ? { ok: true, text: data.explanation }
        : { ok: false, error: "failed" };
    }
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    switch (data.error) {
      case "premium_required":
      case "rate_limited":
      case "unavailable":
      case "unusable":
      case "declined":
        return { ok: false, error: data.error };
      default:
        return { ok: false, error: "failed" };
    }
  } catch {
    return { ok: false, error: "failed" };
  }
}
