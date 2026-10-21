import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Btn, Card } from "@/components/ui-kit";
import { PremiumAccess } from "@/components/premium-access";
import { PaymentTestModeBanner, PremiumCheckout } from "@/components/premium-checkout";
import { useAccount, useSubscription } from "@/hooks/use-account";
import { getStripeEnvironment } from "@/lib/stripe";
import { createPortalSession } from "@/utils/payments.functions";

export const Route = createFileRoute("/pricing")({
  validateSearch: (s: Record<string, unknown>): { checkout?: string } => ({
    checkout: typeof s.checkout === "string" ? s.checkout : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pricing — WhereSucceed" },
      { name: "description", content: "The full decision tool is free. Premium adds AI explanations and Future You narratives." },
      { property: "og:title", content: "Pricing — WhereSucceed" },
      { property: "og:description", content: "Free decision tool. Premium adds AI explanations and Future You narratives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function PremiumAction({ onBuy }: { onBuy: () => void }) {
  const { user, ready } = useAccount();
  const sub = useSubscription(user?.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openPortal = useServerFn(createPortalSession);

  if (!ready) return <Btn variant="accent" className="mt-8 w-full" disabled>Unlock explanations</Btn>;

  if (!user) {
    return (
      <>
        <Btn to="/auth?redirect=/pricing" variant="accent" className="mt-8 w-full">Unlock explanations</Btn>
        <div className="mt-3 text-center text-xs opacity-60">Create a free account first, so Premium follows you to any device.</div>
      </>
    );
  }

  if (sub.active) {
    const end = sub.periodEnd ? new Date(sub.periodEnd).toLocaleDateString() : null;
    return (
      <>
        <Btn variant="accent" className="mt-8 w-full" disabled={busy} onClick={async () => {
          setBusy(true); setError(null);
          const result = await openPortal({ data: { returnUrl: window.location.href, environment: getStripeEnvironment() } });
          setBusy(false);
          if ("error" in result) setError(result.error); else window.open(result.url, "_blank");
        }}>Manage subscription</Btn>
        <div className="mt-3 text-center text-xs opacity-70">
          {sub.cancelAtPeriodEnd && end ? `Premium is on until ${end}.` : "Premium is on for your account."}
        </div>
        {error && <div className="mt-2 text-center text-xs opacity-80">{error}</div>}
      </>
    );
  }

  return (
    <>
      <Btn variant="accent" className="mt-8 w-full" onClick={onBuy}>Unlock explanations</Btn>
      <div className="mt-3 text-center text-xs opacity-60">Cancel any time. You keep Premium until the month you paid for ends.</div>
    </>
  );
}

function Pricing() {
  const { checkout } = Route.useSearch();
  const [open, setOpen] = useState(false);
  return (
    <>
    <PaymentTestModeBanner />
    <div className="mx-auto max-w-4xl px-5 py-16 fade-up">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl">Free where it matters.</h1>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Every score and every number is free, and stays free. Premium adds explanation on top of the numbers.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">Free</div>
          <div className="mt-2 font-serif text-4xl">€0</div>
          <div className="mt-3 text-sm text-muted-foreground">The full tool, with nothing held back for an upgrade.</div>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Full personal mapping, five steps",
              "Ranked paths with match scores",
              "Income at year 1, 5 and 10",
              "Country comparison, cost of living included",
              "Live preference tuning, as often as you like",
              "Your thread, saved as your answers change",
              "No account, no card",
            ].map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <Btn to="/onboarding" variant="outline" className="mt-8 w-full">Start free</Btn>
        </Card>
        <Card className="bg-deep p-8 text-primary-foreground shadow-lift">
          <div className="text-sm text-gold">Premium</div>
          <div className="mt-2 font-serif text-4xl">€6<span className="text-base opacity-70"> /month</span></div>
          <div className="mt-3 text-sm opacity-70">Adds the why to the numbers you already have.</div>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Everything in Free",
              "A written explanation of why each path scores what it does",
              "Which single change would lift your score the most",
              "Side-by-side comparison of your top paths",
              "“Future You” at 25 and 30, built from your own country and income figures",
            ].map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <PremiumAction onBuy={() => setOpen(true)} />
          {checkout === "done" && (
            <div className="mt-3 text-center text-xs opacity-80">Thank you. Premium switches on within a few seconds.</div>
          )}
        </Card>
      </div>
      {open && (
        <Card className="mx-auto mt-8 max-w-2xl p-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <h2 className="text-lg">Premium · €6/month</h2>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <PremiumCheckout />
        </Card>
      )}
      <PremiumAccess />
      <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
        Payments for Premium are processed by Stripe. Applicable VAT and sales tax are added at checkout. See our{" "}
        <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link> and{" "}
        <Link to="/refund" className="underline underline-offset-4 hover:text-foreground">Refund Policy</Link>.
      </p>
      <p className="mt-6 text-center text-sm text-muted-foreground">All scores and numbers stay free forever. Premium only adds personal AI explanations.</p>
    </div>
    </>
  );
}
