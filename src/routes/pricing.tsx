import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card } from "@/components/ui-kit";

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
          <ul className="mt-6 space-y-3 text-sm">
            {["Full personal mapping", "Ranked paths with match scores", "Income at year 1, 5 and 10", "Country comparison", "Live preference tuning", "Your evolving thread"].map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <Btn to="/onboarding" variant="outline" className="mt-8 w-full">Start free</Btn>
        </Card>
        <Card className="bg-deep p-8 text-primary-foreground shadow-lift">
          <div className="text-sm text-gold">Premium</div>
          <div className="mt-2 font-serif text-4xl">€6<span className="text-base opacity-70"> /month</span></div>
          <ul className="mt-6 space-y-3 text-sm">
            {["Everything in Free", "AI explanation of why each path fits you", "“Future You” narratives at 25 and 30", "Deeper comparisons between paths"].map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <Btn variant="accent" className="mt-8 w-full" disabled>Coming soon</Btn>
        </Card>
      </div>
    </div>
  );
}
