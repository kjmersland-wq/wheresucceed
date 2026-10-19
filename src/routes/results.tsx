import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, Chip, NeedsProfile, ScoreRing, Stat } from "@/components/ui-kit";
import { COUNTRIES, type CountryCode } from "@/lib/data";
import { countryResult, fmtEUR, rankPaths, type Prefs } from "@/lib/scoring";
import { setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "My paths — WhereSucceed" },
      { name: "description", content: "Your ranked paths with match scores, income, cost and time to independence." },
      { property: "og:title", content: "My ranked paths — WhereSucceed" },
      { property: "og:description", content: "Ranked paths with real numbers, tuned to you." },
    ],
  }),
  component: Results,
});

function Results() {
  const s = useAppState();
  const [country, setCountry] = useState<CountryCode | "best">("best");
  const [compare, setCompare] = useState(false);
  const ranked = useMemo(() => (s?.profile ? rankPaths(s.profile, s.prefs).slice(0, 6) : []), [s]);
  if (!s) return null;
  if (!s.profile) return <NeedsProfile />;
  const setPrefs = (patch: Partial<Prefs>) => setState((x) => ({ ...x, prefs: { ...x.prefs, ...patch } }));

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1fr_300px]">
      <div>
        <p className="text-sm text-muted-foreground">Your strongest paths right now</p>
        <h1 className="mt-1 text-4xl">Here's where you shine.</h1>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Chip active={country === "best"} onClick={() => setCountry("best")}>Best for each</Chip>
          {COUNTRIES.map((c) => <Chip key={c.code} active={country === c.code} onClick={() => setCountry(c.code)}>{c.flag} {c.code}</Chip>)}
          <button type="button" onClick={() => setCompare((v) => !v)} className="ml-auto text-sm text-accent underline-offset-4 hover:underline">{compare ? "Card view" : "Compare table"}</button>
        </div>

        {compare ? (
          <Card className="mt-6 overflow-x-auto p-0">
            <table className="w-full text-sm tabular">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground"><tr className="border-b border-border">{["Path", "Match", "Year 1", "Year 5", "Year 10", "Education", "Independent"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {ranked.map((r) => {
                  const c = country === "best" ? r.best : countryResult(r.path, country);
                  return (
                    <tr key={r.path.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3"><Link to="/paths/$id" params={{ id: r.path.id }} className="font-medium hover:text-accent">{r.path.title}</Link></td>
                      <td className="px-4 py-3 font-serif text-base">{r.score}</td>
                      {c.income.map((v, i) => <td key={i} className="px-4 py-3">{fmtEUR(v)}</td>)}
                      <td className="px-4 py-3">{r.path.eduYears}y · {fmtEUR(c.eduCost)}</td>
                      <td className="px-4 py-3">~{r.yearsToIndependence}y</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {ranked.map((r, i) => {
              const c = country === "best" ? r.best : countryResult(r.path, country);
              const cn = COUNTRIES.find((x) => x.code === c.code)!;
              return (
                <Link key={r.path.id} to="/paths/$id" params={{ id: r.path.id }} className="block transition-all duration-500 hover:-translate-y-0.5" style={{ order: i }}>
                  <Card className="flex flex-col gap-5 transition-shadow hover:shadow-lift sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4 sm:w-64">
                      <ScoreRing score={r.score} />
                      <div>
                        <div className="text-xs text-muted-foreground">#{i + 1} · {cn.flag} {cn.name}</div>
                        <h3 className="text-xl">{r.path.title}</h3>
                      </div>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                      <Stat label="Year 1 → 10" value={`${fmtEUR(c.income[0])}–${fmtEUR(c.income[2])}`} sub={`${fmtEUR(c.income[1])} at year 5`} />
                      <Stat label="Education" value={`${r.path.eduYears} yrs`} sub={c.eduCost ? `${fmtEUR(c.eduCost)} total` : "Free"} />
                      <Stat label="Independent" value={`~${r.yearsToIndependence} yrs`} />
                      <Stat label="Demand" value={c.demand >= 0.85 ? "Very high" : c.demand >= 0.7 ? "High" : "Moderate"} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <h3 className="text-lg">Tune your ranking</h3>
          <p className="mt-1 text-xs text-muted-foreground">Rankings update instantly.</p>
          <div className="mt-6 space-y-5">
            <Slider label="Focus on income" v={s.prefs.income} on={(v) => setPrefs({ income: v })} />
            <Slider label="Shorter education" v={s.prefs.shortEdu} on={(v) => setPrefs({ shortEdu: v })} />
            <Slider label="Remote-friendly" v={s.prefs.remote} on={(v) => setPrefs({ remote: v })} />
            <label className="flex cursor-pointer items-center justify-between text-sm">
              Stay in my country
              <input type="checkbox" checked={s.prefs.stayHome} onChange={(e) => setPrefs({ stayHome: e.target.checked })} className="h-4 w-4 accent-[var(--color-accent)]" />
            </label>
          </div>
        </Card>
        <Card className="mt-4 bg-deep text-primary-foreground">
          <div className="text-xs uppercase tracking-wider text-gold">Premium</div>
          <p className="mt-2 font-serif text-lg">Why does this fit you? Meet Future You.</p>
          <Link to="/pricing" className="mt-3 inline-block text-sm underline underline-offset-4 opacity-80 hover:opacity-100">See Premium →</Link>
        </Card>
      </aside>
    </div>
  );
}

function Slider({ label, v, on }: { label: string; v: number; on: (v: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><span>{label}</span><span className="tabular text-muted-foreground">{v}</span></div>
      <input type="range" min={0} max={100} value={v} onChange={(e) => on(+e.target.value)} className="w-full accent-[var(--color-accent)]" aria-label={label} />
    </div>
  );
}
