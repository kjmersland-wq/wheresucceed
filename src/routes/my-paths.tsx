import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Chip, NeedsProfile, ScoreRing, Stat } from "@/components/ui-kit";
import { analyseProfile, rerank, type CareerMatch, type ProfileAnalysis } from "@/engine";
import { COUNTRIES, type CountryCode } from "@/lib/data";
import { toPreferenceWeights, toUserProfile } from "@/lib/profile-adapter";
import { fmtEUR, type Prefs } from "@/lib/scoring";
import { setState, useAppState } from "@/lib/store";
import { useFlip } from "@/lib/use-flip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-paths")({
  head: () => ({
    meta: [
      { title: "My paths — WhereSucceed" },
      { name: "description", content: "Your ranked paths with match scores, income, cost and time to independence." },
      { property: "og:title", content: "My ranked paths — WhereSucceed" },
      { property: "og:description", content: "Ranked paths with real numbers, tuned to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Results,
});

function Results() {
  const s = useAppState();
  const [country, setCountry] = useState<CountryCode | "best">("best");
  const [compare, setCompare] = useState(false);
  const profile = useMemo(() => (s?.profile ? toUserProfile(s.profile) : null), [s?.profile]);
  // The slow part depends only on the profile; moving a slider only re-weights it.
  const analysis = useMemo(() => (profile ? analyseProfile(profile) : null), [profile]);
  // The same analysis with every country open, so a country chip works whatever the move setting.
  const analysisAll = useMemo(
    () =>
      profile
        ? analyseProfile({ ...profile, constraints: { ...profile.constraints, willingToMove: "anywhere" } })
        : null,
    [profile],
  );
  const weights = useMemo(() => (s ? toPreferenceWeights(s.prefs) : null), [s?.prefs]);

  // Each ranking is compared with the one before it, so cards can show how far they moved.
  const previous = useRef<CareerMatch[]>([]);
  const all = useMemo(
    () => (analysis && weights ? rerank(analysis, weights, previous.current) : []),
    [analysis, weights],
  );
  useEffect(() => {
    previous.current = all;
  }, [all]);
  const ranked = all.slice(0, 6);
  const flip = useFlip(ranked.map((r) => r.isco));
  if (!s) return null;
  if (!s.profile) return <NeedsProfile />;
  const view = (r: CareerMatch) => countryView(r, country, analysisAll);
  const setPrefs = (patch: Partial<Prefs>) => setState((x) => ({ ...x, prefs: { ...x.prefs, ...patch } }));
  const home = COUNTRIES.find((c) => c.code === s.profile!.home)!;
  const top = ranked[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Based on your mapping</p>
          <h1 className="mt-1 text-4xl md:text-5xl">Your paths, ranked.</h1>
        </div>
        {top && (
          <div className="flex gap-8">
            <Stat label="Top match" value={String(top.matchScore)} sub={top.title} />
            <Stat label="Paths ranked" value={String(all.length)} sub={`${ranked.length} shown`} />
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
                const c = view(r);
                const cn_ = COUNTRIES.find((x) => x.code === c.code)!;
                return (
                  <tr key={r.isco} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{r.title}</td>
                    <td className="px-4 py-3 font-serif text-base">{r.matchScore}</td>
                    <td className="px-4 py-3">{cn_.flag} {cn_.code}</td>
                    {c.income.map((v, j) => <td key={j} className="px-4 py-3">{fmtEUR(v)}</td>)}
                    <td className="px-4 py-3">{c.eduCost ? fmtEUR(c.eduCost) : "Free"}</td>
                    <td className="px-4 py-3">~{c.years} yrs</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {ranked.map((r, i) => (
            <div key={r.isco} ref={flip(r.isco)}>
              <PathCard r={r} rank={i + 1} c={view(r)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type CountryNumbers = {
  code: CountryCode;
  income: [number, number, number];
  eduCost: number;
  years: number;
};

/** The numbers to show for a career: its best country, or the country picked with the chips. */
function countryView(
  r: CareerMatch,
  country: CountryCode | "best",
  analysisAll: ProfileAnalysis | null,
): CountryNumbers {
  const best: CountryNumbers = {
    code: r.bestCountry,
    income: [r.incomeYear1, r.incomeYear5, r.incomeYear10],
    eduCost: r.educationCost,
    years: r.timeToIndependence,
  };
  if (country === "best") return best;
  const option = analysisAll?.careers
    .find((c) => c.occupation.isco === r.isco)
    ?.options.find((o) => o.country === country);
  return option
    ? {
        code: country,
        income: [option.incomeYear1, option.incomeYear5, option.incomeYear10],
        eduCost: option.educationCost,
        years: option.timeToIndependence,
      }
    : best;
}

function PathCard({ r, rank, c }: { r: CareerMatch; rank: number; c: CountryNumbers }) {
  const cn_ = COUNTRIES.find((x) => x.code === c.code)!;
  const max = Math.max(c.income[2], 1);
  const moved = r.rankChange ?? 0;
  return (
    <Card className="grid gap-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift md:grid-cols-[260px_1fr_auto] md:items-center">
      <div className="flex items-center gap-4">
        <ScoreRing score={r.matchScore} size={72} />
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground tabular">
            <span>Rank {rank}</span>
            {moved !== 0 && (
              <span className={moved > 0 ? "text-accent" : undefined}>
                {moved > 0 ? "▲" : "▼"} {Math.abs(moved)}
              </span>
            )}
          </div>
          <h3 className="text-xl leading-tight">{r.title}</h3>
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
        <Stat label="Entry cost" value={c.eduCost ? fmtEUR(c.eduCost) : "Free"} />
        <Stat label="Independent" value={`~${c.years} yrs`} sub="from today" />
      </div>

      <details className="md:col-span-3">
        <summary className="cursor-pointer text-sm text-accent underline-offset-4 hover:underline">Why this rank</summary>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {r.reasons.map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      </details>
    </Card>
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
