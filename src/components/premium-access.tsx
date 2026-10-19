import { useState } from "react";
import { Btn, Card } from "@/components/ui-kit";
import { activatePremium, deactivatePremium, usePremium, type ActivateResult } from "@/lib/premium";

const MESSAGES: Record<Exclude<ActivateResult, "ok">, string> = {
  invalid: "That code was not recognised.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  error: "We could not check the code right now. Please try again.",
};

/** Where someone with a Premium access code switches Premium on for this device. */
export function PremiumAccess() {
  const premium = usePremium();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await activatePremium(code);
    setBusy(false);
    if (result === "ok") setCode("");
    else setMessage(MESSAGES[result]);
  }

  return (
    <Card className="mx-auto mt-8 max-w-xl p-6">
      {premium.active ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <span className="font-medium">Premium is on for this device.</span> You will see
            “Explain this path” on your ranked paths.
          </p>
          <Btn variant="ghost" onClick={deactivatePremium}>
            Turn off
          </Btn>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor="premium-code" className="text-sm font-medium">
            Have a Premium access code?
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="premium-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm"
              placeholder="Enter your code"
            />
            <Btn type="submit" variant="outline" disabled={busy || code.trim() === ""}>
              {busy ? "Checking…" : "Activate"}
            </Btn>
          </div>
          {message && (
            <p role="alert" className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
        </form>
      )}
    </Card>
  );
}
