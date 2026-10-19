import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Bar, Btn, Card, NeedsProfile, ScoreRing, Stat } from "@/components/ui-kit";
import { COUNTRIES, PATHS } from "@/lib/data";
import { fmtEUR, scorePath } from "@/lib/scoring";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/paths/$id")({
  loader: ({ params }) => {
    const path = PATHS.find((p) => p.id === params.id);
    if (!path) throw notFound();
    return { title: path.title, tagline: path.tagline };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — WhereSucceed` : "Path — WhereSucceed" },
      { name: "description", content: loaderData?.tagline ?? "Career path details" },
      { property: "og:title", content: loaderData ? `${loaderData.title} — WhereSucceed` : "Path — WhereSucceed" },
      { property: "og:description", content: loaderData?.tagline ?? "Career path details" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const s = useAppState();
  if (!s) return null;
  if (!s.profile) return <NeedsProfile />;
  const path = PATHS.find((p) => p.id === id)!;
  const r = scorePath(path, s.profile, { ...s.prefs, stayHome: false });
  const all = COUNTRIES.map((c) => ({ c, ...scorePath(path, { ...s.profile!, mobility: "anywhere" }, s.prefs).countries.find((x) => x.code === c.code)! }));
  const max = Math.max(...all.map((a) => a.income[2]));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 fade-up">
      <Link to="/my-paths" className="text-sm text-muted-foreground hover:text-foreground">← All paths</Link>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={r.score} size={96} />
        <div>
          <h1 className="text-4xl md:text-5xl">{path.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{path.tagline}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <h3 className="text-lg">Income trajectory · {COUNTRIES.find((c) => c.code === r.best.code)!.name}</h3>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {r.best.income.map((v, i) => <Stat key={i} label={`Year ${[1, 5, 10][i]}`} value={fmtEUR(v)} />)}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <Stat label="Education" value={`${path.eduYears} yrs`} />
            <Stat label="Entry cost" value={r.best.eduCost ? fmtEUR(r.best.eduCost) : "Free"} />
            <Stat label="Independent in" value={`~${r.yearsToIndependence} yrs`} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg">Why it scores {r.score}</h3>
          <div className="mt-5 space-y-4">
            <Bar label="Interest fit" value={r.breakdown.interests} />
            <Bar label="Skill fit" value={r.breakdown.skills} />
            <Bar label="Values fit" value={r.breakdown.values} />
            <Bar label="Practical fit" value={r.breakdown.practical} />
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="text-lg">Country comparison · year 10 income</h3>
        <div className="mt-6 space-y-3">
          {all.sort((a, b) => b.income[2] - a.income[2]).map((a) => (
            <div key={a.c.code} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-sm">
              <span>{a.c.flag} {a.c.name}</span>
              <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${(a.income[2] / max) * 100}%` }} /></div>
              <span className="tabular text-right">{fmtEUR(a.income[2])}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg">Your next steps</h3>
          <ol className="mt-5 space-y-4">
            {path.steps.map((st, i) => <li key={i} className="flex gap-4"><span className="font-serif text-accent">{i + 1}</span><span>{st}</span></li>)}
          </ol>
        </Card>
        <Card className="bg-deep text-primary-foreground">
          <div className="text-xs uppercase tracking-wider text-gold">Premium · AI</div>
          <h3 className="mt-2 text-2xl">Future You, at 30</h3>
          <p className="mt-3 text-sm opacity-75">A clear explanation of why {path.title.toLowerCase()} fits your profile, and a grounded look at what a typical day looks like ten years in.</p>
          <Btn to="/pricing" variant="accent" className="mt-6">Unlock with Premium</Btn>
        </Card>
      </div>
    </div>
  );
}
