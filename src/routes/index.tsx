import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { Btn } from "@/components/ui-kit";
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
          <div className="mt-9 flex flex-wrap gap-3">
            <Btn to="/onboarding">Start my mapping →</Btn>
            <Btn to="/pricing" variant="ghost">How it works</Btn>
          </div>
        </div>
        <div className="fade-up overflow-hidden rounded-3xl shadow-lift" style={{ animationDelay: "120ms" }}>
          <img src={hero} alt="Diverging paths toward distant cities at dawn" className="aspect-[5/4] w-full object-cover" width={1280} height={1024} />
        </div>
      </section>

      <section className="bg-deep text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-3">
          {[
            { n: "01", t: "Map yourself", d: "Interests, skills, values and real-life constraints. Scales and choices — no essays." },
            { n: "02", t: "See ranked paths", d: "Match scores, income at year 1, 5 and 10, education cost and time to independence." },
            { n: "03", t: "Compare where", d: "Switch countries and tune what matters. Rankings update instantly." },
          ].map((s) => (
            <div key={s.n}>
              <div className="font-serif text-sm text-gold">{s.n}</div>
              <h3 className="mt-2 text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm opacity-75">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pt-24 text-center">
        <h2 className="text-3xl md:text-4xl">Transparent by design.</h2>
        <p className="mt-4 text-muted-foreground">Every score is calculated from clear rules and labour-market data. You can see exactly why a path ranks where it does — and change it.</p>
        <Btn to="/onboarding" className="mt-8">Begin — it takes 4 minutes</Btn>
      </section>
    </>
  );
}
