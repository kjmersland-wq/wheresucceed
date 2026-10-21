import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { Btn } from "@/components/ui-kit";
import { CompareCountriesArt, MapYourselfArt, RankedPathsArt } from "@/components/illustrations";
import social from "@/assets/brand/wheresucceed-og.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WhereSucceed — Find where you have the best chance to succeed" },
      { name: "description", content: "A data-driven decision tool for 16–28 year olds: ranked career paths, real income numbers and the best countries for you." },
      { property: "og:title", content: "WhereSucceed — Find where you'll succeed" },
      { property: "og:description", content: "Ranked career paths, real income numbers and the best countries for you." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://pixel-perfect-replay-435.lovable.app${social.url}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Find out where you have the best chance to succeed. Ranked paths with real numbers. Free." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://pixel-perfect-replay-435.lovable.app${social.url}` },
      { name: "twitter:image:alt", content: "WhereSucceed — ranked paths with real numbers. Free." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-24">
        <div className="fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-foreground">For ages 16–28 · Free to use</p>
          <h1 className="text-5xl leading-[1.05] md:text-6xl">Find out where you have the <em className="text-accent">best chance</em> to succeed.</h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">Map who you are in a few minutes. See ranked paths with real numbers — income, cost, time — across countries. Clear rules, no guesswork.</p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Btn to="/onboarding" size="lg" className="w-full shadow-lift sm:w-auto">Begin — it takes 4 minutes →</Btn>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">How it works</a>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">Free, no account, no card. Everything you see is built on open, transparent labour-market data, so you can trust the numbers and see where they come from.</p>
        </div>
        <div className="fade-up overflow-hidden rounded-3xl shadow-lift" style={{ animationDelay: "120ms" }}>
          <img src={hero} alt="Diverging paths toward distant cities at dawn" className="aspect-[5/4] w-full object-cover" width={1280} height={1024} fetchPriority="high" decoding="async" />
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-16 bg-deep text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 pt-20">
          <h2 className="text-3xl md:text-4xl">How it works</h2>
          <p className="mt-3 max-w-xl text-sm opacity-75">Three friendly steps, about four minutes, and nothing to sign up for.</p>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-10 md:grid-cols-3">
          {[
            { n: "01", art: <MapYourselfArt />, t: "Map yourself", d: "Interests, skills, values and real-life constraints. Just a few taps, no essays and no wrong answers. It takes about 4 minutes." },
            { n: "02", art: <RankedPathsArt />, t: "See ranked paths", d: "Match scores, income at year 1, 5 and 10, education cost and time to independence — and a plain-language reason for why each one suits you." },
            { n: "03", art: <CompareCountriesArt />, t: "Compare where", d: "Curious how life looks somewhere else? Switch countries and watch your ranking update on the spot." },
          ].map((s) => (
            <div key={s.n}>
              <div className="overflow-hidden rounded-2xl">{s.art}</div>
              <div className="mt-5 font-serif text-sm text-gold">{s.n}</div>
              <h3 className="mt-2 text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm opacity-75">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pt-24 text-center">
        <h2 className="text-3xl md:text-4xl">Transparent by design.</h2>
        <p className="mt-4 text-muted-foreground">Every score is calculated from clear rules and labour-market data. You can see exactly why a path ranks where it does — and change it.</p>
        <Btn to="/onboarding" size="lg" className="mt-8 shadow-lift">Begin — it takes 4 minutes →</Btn>
      </section>
    </>
  );
}
