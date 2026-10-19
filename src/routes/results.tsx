import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Card, Chip, NeedsProfile, ScoreRing, Stat } from "@/components/ui-kit";
import { COUNTRIES, type CountryCode } from "@/lib/data";
import { countryResult, fmtEUR, rankPaths, type PathResult, type Prefs } from "@/lib/scoring";
import { setState, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

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

/** FLIP animation: cards glide to their new rank position. */
function useFlip(keys: string[]) {
  const refs = useRef(new Map<string, HTMLElement>());
  const prev = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    refs.current.forEach((el, k) => {
      const top = el.getBoundingClientRect().top;
      const old = prev.current.get(k);
      if (old !== undefined && old !== top) {
        el.animate([{ transform: `translateY(${old - top}px)` }, { transform: "translateY(0)" }], {
          duration: 650,
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        });
      }
      prev.current.set(k, top);
    });
  }, [keys.join("|")]);
  return (k: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(k, el);
    else refs.current.delete(k);
  };
}

function Results() {
  const s = useAppState();
  const [country, setCountry] = useState<CountryCode | "best">("best");
  const [compare, setCompare] = useState(false);
  const ranked = useMemo(() => (s?.profile ? rankPaths(s.profile, s.prefs).slice(0, 6) : []), [s]);
  const flip = useFlip(ranked.map((r) => r.path.id));
  if (!s) return null;
  if (!s.profile) return <NeedsProfile />;
  const setPrefs = (patch: Partial<Prefs>) => setState((x) => ({ ...x, prefs: { ...x.prefs, ...patch } }));
  const home = COUNTRIES.find((c) => c.code === s.profile!.home)!;
  const top = ranked[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Your ranked paths</p>
          <h1 className="mt-1 text-4xl md:text-5xl">Here's where you shine.</h1>
        </div>
        {top && (
          <div className="flex gap-8">
            <Stat label="Top match" value={String(top.score)} sub={top.path.title} />
            <Stat label="Paths ranked" value="12" sub="6 shown" />
          </div>
        )}
      </div>

      {/* Preference bar */}
      <Card className="mt-8 grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="Income focus" v={s.prefs.income} on={(v) => setPrefs({ income: v })} />
        <Slider label="Shorter education" v={s.prefs.shortEdu} on={(v) => setPrefs({ shortEdu: v })} />
        <Slider label="Remote-friendly" v={s.prefs.remote} on={(v) => setPrefs({ remote: v })} />
        <div>
          <div className="mb-2 text-sm">Stay in {home.name}</div>
          <button
            type="button"
            role="switch"
            aria-checked={s.prefs.stayHome}
            onClick={() => setPrefs({ stayHome: !s.prefs.stayHome })}
            className={cn("relative h-7 w-12 rounded-full transition-colors duration-300", s.prefs.stayHome ? "bg-accent" : "bg-border")}
          >
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-card shadow-soft transition-all duration-300", s.prefs.stayHome ? "left-6" : "left-1")} />
          </button>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Chip active={country === "best"} onClick={() => setCountry("best")}>Best country</Chip>
        {COUNTRIES.map((c) => (
          <Chip key={c.code} active={country === c.code} onClick={() => setCountry(c.code)}>{c.flag} {c.code}</Chip>
        ))}
        <button type="button" onClick={() => setCompare((v) => !v)} className="ml-auto text-sm text-accent underline-offset-4 hover:underline">
          {compare ? "Card view" : "Compare table"}
        </button>
      </div>

      {compare ? (
        <Card className="mt-6 overflow-x-auto p-0">
          <table className="w-full text-sm tabular">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">{["#", "Path", "Match", "Country", "Year 1", "Year 5", "Year 10", "Entry cost", "Independent"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => {
                const c = country === "best" ? r.best : countryResult(r.path, country);
                const cn_ = COUNTRIES.find((x) => x.code === c.code)!;
                return (
                  <tr key={r.path.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3"><Link to="/paths/$id" params={{ id: r.path.id }} className="font-medium hover:text-accent">{r.path.title}</Link></td>
                    <td className="px-4 py-3 font-serif text-base">{r.score}</td>
                    <td className="px-4 py-3">{cn_.flag} {cn_.code}</td>
                    {c.income.map((v, j) => <td key={j} className="px-4 py-3">{fmtEUR(v)}</td>)}
                    <td className="px-4 py-3">{c.eduCost ? fmtEUR(c.eduCost) : "Free"}</td>
                    <td className="px-4 py-3">~{r.yearsToIndependence} yrs</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {ranked.map((r, i) => (
            <div key={r.path.id} ref={flip(r.path.id)}>
              <PathCard r={r} rank={i + 1} country={country} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PathCard({ r, rank, country }: { r: PathResult; rank: number; country: CountryCode | "best" }) {
  const c = country === "best" ? r.best : countryResult(r.path, country);
  const cn_ = COUNTRIES.find((x) => x.code === c.code)!;
  const max = Math.max(c.income[2], 1);
  return (
    <Link to="/paths/$id" params={{ id: r.path.id }} className="block">
      <Card className="grid gap-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift md:grid-cols-[260px_1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <ScoreRing score={r.score} size={72} />
          <div>
            <div className="text-xs text-muted-foreground tabular">Rank {rank}</div>
            <h3 className="text-xl leading-tight">{r.path.title}</h3>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-foreground">{cn_.flag} {cn_.name}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Income · year 1 / 5 / 10</div>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {c.income.map((v, j) => (
              <div key={j}>
                <div className="flex h-10 items-end"><div className="w-full rounded-t-md bg-primary/80 transition-all duration-700" style={{ height: `${(v / max) * 100}%`, opacity: 0.45 + j * 0.27 }} /></div>
                <div className="mt-1.5 font-serif text-base tabular">{fmtEUR(v)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <Stat label="Entry cost" value={c.eduCost ? fmtEUR(c.eduCost) : "Free"} sub={`${r.path.eduYears} yrs study`} />
          <Stat label="Independent" value={`~${r.yearsToIndependence} yrs`} sub="from today" />
        </div>
      </Card>
    </Link>
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
