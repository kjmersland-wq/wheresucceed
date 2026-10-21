import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { Link } from "@tanstack/react-router";
import { Btn } from "@/components/ui-kit";
import { CompareCountriesArt, MapYourselfArt, RankedPathsArt } from "@/components/illustrations";
import social from "@/assets/brand/wheresucceed-og.png.asset.json";

const FAQ = [
  [
    "How does the ranking work?",
    "We start with what you tell us: your interests, skills, what matters most to you and your real-life limits. Each career path gets a match score from 0 to 100 that blends how well it fits you with income, education cost and how soon you could be independent. Every path comes with a short, friendly reason for its rank, so you always see why."
  ],
  [
    "Is WhereSucceed really free?",
    "Yes. The full tool is free: every score, every income number and every country comparison, with no account and no card. An optional Premium plan (not open yet) will add written explanations on top, but the numbers always stay free. See the pricing page for details."
  ],
  [
    "Which countries are included?",
    "Right now you can explore Norway, Sweden, Denmark, Germany, the Netherlands, the United Kingdom and the United States. Choose the one you would like to see and your ranking updates straight away."
  ],
  [
    "How long does it take, and do I need an account?",
    "About four minutes, and no account is needed. It is five short steps with taps and sliders, no essays. Your answers stay on your device, and you can change them whenever you like."
  ],
  [
    "Where do the numbers come from?",
    "Income, education cost and time to independence come from transparent labour-market data and clear rules, not guesswork. They are estimates meant to help you compare paths, not promises, and you can read how we handle data in our privacy policy."
  ],
  [
    "Who is WhereSucceed for?",
    "Anyone aged 16 to 28 who is wondering what to study, work on or aim for next, and where in the world it could work best for them. Not sure yet? That is exactly who we built it for."
  ]
] as const;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find where to succeed: career path matching for young people | WhereSucceed" },
      { name: "description", content: "Not sure what to do next? Map your interests and strengths in 4 minutes and see ranked career paths with real income numbers, plus the best countries for young people. Free, no account." },
      { property: "og:title", content: "WhereSucceed: find where you have the best chance to succeed" },
      { property: "og:description", content: "Map yourself in 4 minutes and see ranked career paths with real income numbers, and the best countries for you. Free, no account." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "WhereSucceed" },
      { property: "og:url", content: "https://www.wheresucceed.com/" },
      { property: "og:locale", content: "en" },
      { property: "og:image", content: `https://pixel-perfect-replay-435.lovable.app${social.url}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Find out where you have the best chance to succeed. Ranked paths with real numbers. Free." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "WhereSucceed: find where you have the best chance to succeed" },
      { name: "twitter:description", content: "Ranked career paths, real income numbers and the best countries for you. Free." },
      { name: "twitter:image", content: `https://pixel-perfect-replay-435.lovable.app${social.url}` },
      { name: "twitter:image:alt", content: "WhereSucceed — ranked paths with real numbers. Free." },
    ],
    links: [{ rel: "canonical", href: "https://www.wheresucceed.com/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(FAQ_JSON_LD) }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-24">
        <div className="fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-foreground">Career path matching for ages 16–28 · Free to use</p>
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
          <h2 className="text-3xl md:text-4xl">How it works: career path matching in three friendly steps</h2>
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
        <h2 className="text-3xl md:text-4xl">Discover the best countries for young people, with numbers you can trust.</h2>
        <p className="mt-4 text-muted-foreground">Every score is calculated from clear rules and labour-market data, so you can see exactly why a path ranks where it does, and change it. Wondering where to succeed? Compare Norway, Sweden, Denmark, Germany, the Netherlands, the UK and the US side by side.</p>
        <Btn to="/onboarding" size="lg" className="mt-8 shadow-lift">Begin — it takes 4 minutes →</Btn>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-5 pt-24">
        <h2 className="text-center text-3xl md:text-4xl">Questions? We are happy to help.</h2>
        <p className="mt-3 text-center text-muted-foreground">The things people ask us most, answered in plain words.</p>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                {q}
                <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ready when you are: <Link to="/onboarding" className="text-accent underline underline-offset-4">start your mapping</Link>, take a look at <Link to="/pricing" className="text-accent underline underline-offset-4">pricing</Link>, or read how we look after <Link to="/privacy" className="text-accent underline underline-offset-4">your data</Link>.
        </p>
      </section>
    </>
  );
}
