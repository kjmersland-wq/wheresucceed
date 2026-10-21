import { useMemo, useState } from "react";
import type { PreferenceWeights, UserProfile } from "@/engine";
import { requestExplanation, type ExplainError } from "@/lib/explain/client";
import { deactivatePremium, usePremium } from "@/lib/premium";
import { useAccount, useSubscription } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";

const MESSAGES: Record<ExplainError, string> = {
  premium_required:
    "Your Premium access code is no longer valid, so explanations are switched off.",
  rate_limited: "You have reached the hourly limit for explanations. Try again a little later.",
  unavailable:
    "Explanations are not available right now. Everything else on this page works as usual.",
  unusable:
    "We could not write a reliable explanation this time. The numbers and reasons above are unchanged.",
  declined:
    "We could not write an explanation for this one. The numbers and reasons above are unchanged.",
  failed: "Something went wrong while writing the explanation. Please try again.",
};

/** Explanations already written this visit, so reordering the cards does not ask again. */
const written = new Map<string, string>();

/**
 * The Premium "Explain this path" button. It renders nothing at all unless Premium is
 * on, and it is the only place in the app that asks for an AI-written text.
 */
export function ExplainPath({
  isco,
  profile,
  prefs,
}: {
  isco: string;
  profile: UserProfile;
  prefs: PreferenceWeights;
}) {
  const premium = usePremium();
  const { user } = useAccount();
  const sub = useSubscription(user?.id);
  // An explanation belongs to one profile and one set of sliders; change either and it is stale.
  const key = useMemo(() => JSON.stringify([isco, profile, prefs]), [isco, profile, prefs]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ExplainError | null>(null);
  const [, refresh] = useState(0);

  const hasCode = premium.active && Boolean(premium.code);
  if (!sub.active && !hasCode) return null;
  const text = written.get(key);

  async function run() {
    setBusy(true);
    setError(null);
    const accessToken = sub.active ? (await supabase.auth.getSession()).data.session?.access_token : null;
    const result = await requestExplanation({
      code: premium.code ?? "subscription",
      isco,
      profile,
      prefs,
      accessToken: accessToken ?? null,
    });
    setBusy(false);
    if (result.ok) {
      written.set(key, result.text);
      refresh((n) => n + 1);
      return;
    }
    if (result.error === "premium_required" && !sub.active) deactivatePremium();
    setError(result.error);
  }

  return (
    <div className="md:col-span-3" data-premium="explain">
      {!text && (
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-foreground/30 disabled:opacity-60"
        >
          {busy ? "Explaining…" : "Explain this path"}
          <span className="rounded-full bg-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Premium
          </span>
        </button>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-muted-foreground">
          {MESSAGES[error]}
        </p>
      )}
      {text && (
        <div className="rounded-xl bg-accent-soft/50 p-4">
          <div className="space-y-2 text-sm leading-relaxed">
            {text.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Written by AI from the numbers above and your mapping. It adds nothing that is not in
            them.
          </p>
        </div>
      )}
    </div>
  );
}
