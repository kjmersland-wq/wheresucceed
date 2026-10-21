import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Btn, Card } from "@/components/ui-kit";
import { PremiumAccess } from "@/components/premium-access";

export const Route = createFileRoute("/pricing")({
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

function Pricing() {
  return (
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
          <Btn variant="accent" className="mt-8 w-full" disabled>Unlock explanations</Btn>
          <div className="mt-3 text-center text-xs opacity-60">Not open yet — nothing is charged until you turn it on.</div>
        </Card>
      </div>
      <PremiumAccess />
      <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
        Payments for Premium will be processed securely by Stripe. Paid subscriptions are not open yet. See our{" "}
        <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link> and{" "}
        <Link to="/refund" className="underline underline-offset-4 hover:text-foreground">Refund Policy</Link>.
      </p>
      <p className="mt-6 text-center text-sm text-muted-foreground">All scores and numbers stay free forever. Premium only adds personal AI explanations.</p>
    </div>
  );
}
