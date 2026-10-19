import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExplainPath } from "@/components/explain-path";
import { Bar, Btn, Card, ScoreRing, Stat } from "@/components/ui-kit";
import {
  DEFAULT_PREFERENCES,
  analyseProfile,
  rerank,
  COUNTRIES,
  type CareerMatch,
  type CountryCode,
  type PreferenceWeights,
  type UserProfile,
} from "@/engine";
import { SAMPLE_PROFILE, toUserProfile } from "@/lib/profile-adapter";
import { useAppState } from "@/lib/store";
import { useFlip } from "@/lib/use-flip";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Results dashboard — WhereSucceed" },
      {
        name: "description",
        content:
          "Your top paths with match score, income at year 1, 5 and 10, education cost, time to independence and country. Tune what matters and watch the ranking change.",
      },
      { property: "og:title", content: "Results dashboard — WhereSucceed" },
      { property: "og:description", content: "Ranked paths with real numbers, tuned to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const SHOWN = 6;

const FLAGS: Record<CountryCode, string> = {
  NO: "🇳🇴",
  SE: "🇸🇪",
  DK: "🇩🇰",
  DE: "🇩🇪",
  NL: "🇳🇱",
  UK: "🇬🇧",
  US: "🇺🇸",
};

/** €48k, €1.5k, €900; zero reads as "Free". */
function eur(n: number): string {
  if (n === 0) return "Free";
  if (n < 1000) return `€${n}`;
  const k = n / 1000;
  return `€${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}k`;
}

const SLIDERS: { key: keyof PreferenceWeights; label: string; hint: string }[] = [
  { key: "incomeFocus", label: "Income focus", hint: "Higher pay counts for more" },
  { key: "stayLocal", label: "Stay local", hint: "Other countries count for less" },
  { key: "shortEducation", label: "Shorter education", hint: "Quicker routes count for more" },
];

function Dashboard() {
  const s = useAppState();
  const [prefs, setPrefs] = useState<PreferenceWeights>(DEFAULT_PREFERENCES);

  const hasOwnProfile = Boolean(s?.profile);
  const profile = useMemo(
    () => (s?.profile ? toUserProfile(s.profile) : SAMPLE_PROFILE),
    [s?.profile],
  );
  // The slow part depends only on the profile; moving a slider only re-weights it.
  const analysis = useMemo(() => analyseProfile(profile), [profile]);

  // Each ranking is compared with the one before it, so cards can show how far they moved.
  const previous = useRef<CareerMatch[]>([]);
  const ranking = useMemo(() => rerank(analysis, prefs, previous.current), [analysis, prefs]);
  useEffect(() => {
    previous.current = ranking;
  }, [ranking]);

  const shown = ranking.slice(0, SHOWN);
  const flip = useFlip(shown.map((m) => m.isco));

  if (!s) return null;

  const home = COUNTRIES.find((c) => c.code === profile.constraints.currentCountry);
  const top = shown[0];
  const changed = prefs.incomeFocus > 0 || prefs.stayLocal > 0 || prefs.shortEducation > 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 fade-up">
        <div>
          <p className="text-sm text-muted-foreground">
            {hasOwnProfile ? "Based on your mapping" : "Based on a sample profile"}
          </p>
          <h1 className="mt-1 text-4xl md:text-5xl">Your paths, ranked.</h1>
        </div>
        {top && (
          <div className="flex gap-8">
            <Stat label="Top match" value={String(top.matchScore)} sub={top.title} />
            <Stat
              label="Paths ranked"
              value={String(ranking.length)}
              sub={`${shown.length} shown`}
            />
          </div>
        )}
      </div>

      {!hasOwnProfile && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-accent-soft/60 p-5">
          <p className="max-w-xl text-sm">
            You are looking at an example. Map yourself and these cards will be calculated from your
            own interests, skills and priorities.
          </p>
          <Btn to="/onboarding" variant="outline">
            Start my mapping
          </Btn>
        </Card>
      )}

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg">What matters to you?</h2>
          <button
            type="button"
            onClick={() => setPrefs(DEFAULT_PREFERENCES)}
            disabled={!changed}
            className="text-sm text-accent underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            Reset
          </button>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {SLIDERS.map((slider) => (
            <Slider
              key={slider.key}
              label={slider.key === "stayLocal" && home ? `Stay in ${home.name}` : slider.label}
              hint={slider.hint}
              value={prefs[slider.key]}
              onChange={(v) => setPrefs((p) => ({ ...p, [slider.key]: v }))}
            />
          ))}
        </div>
      </Card>

      <p className="sr-only" aria-live="polite">
        {top ? `Top match is now ${top.title}, ${top.matchScore} out of 100.` : ""}
      </p>

      <ol className="mt-6 space-y-4">
        {shown.map((match) => (
          <li key={match.isco} ref={flip(match.isco)}>
            <PathCard match={match} profile={profile} prefs={prefs} />
          </li>
        ))}
      </ol>

      <p className="mt-8 text-xs text-muted-foreground">
        Incomes are gross yearly estimates in euro and the country shown is the best fit for you
        given the settings above. They are planning figures from mock occupation data, not
        guarantees.
      </p>
    </div>
  );
}

function PathCard({
  match,
  profile,
  prefs,
}: {
  match: CareerMatch;
  profile: UserProfile;
  prefs: PreferenceWeights;
}) {
  const country = COUNTRIES.find((c) => c.code === match.bestCountry);
  const incomes = [match.incomeYear1, match.incomeYear5, match.incomeYear10];
  const max = Math.max(...incomes, 1);
  const moved = match.rankChange ?? 0;

  return (
    <Card className="grid gap-6 transition-shadow duration-300 hover:shadow-lift md:grid-cols-[260px_1fr_auto] md:items-center">
      <div className="flex items-center gap-4">
        <ScoreRing score={match.matchScore} size={72} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground tabular">
            <span>Rank {match.rank}</span>
            {moved !== 0 && (
              <span className={moved > 0 ? "text-accent" : "text-muted-foreground"}>
                {moved > 0 ? "▲" : "▼"} {Math.abs(moved)}
              </span>
            )}
          </div>
          <h3 className="text-xl leading-tight">{match.title}</h3>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-foreground">
            {FLAGS[match.bestCountry]} {country?.name ?? match.bestCountry}
          </span>
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Income · year 1 / 5 / 10
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {incomes.map((value, i) => (
            <div key={i}>
              <div className="flex h-10 items-end">
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all duration-700"
                  style={{ height: `${(value / max) * 100}%`, opacity: 0.45 + i * 0.27 }}
                />
              </div>
              <div className="mt-1.5 font-serif text-base tabular">{eur(value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
        <Stat label="Education cost" value={eur(match.educationCost)} />
        <Stat label="Independent" value={`~${match.timeToIndependence} yrs`} sub="from today" />
      </div>

      <ExplainPath isco={match.isco} profile={profile} prefs={prefs} />

      <details className="group md:col-span-3">
        <summary className="cursor-pointer text-sm text-accent underline-offset-4 hover:underline">
          Why this rank
        </summary>
        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <Bar label="Interests" value={match.breakdown.interests / 100} />
          <Bar label="Skills" value={match.breakdown.skills / 100} />
          <Bar label="Priorities" value={match.breakdown.values / 100} />
          <Bar label="Time to independence" value={match.breakdown.feasibility / 100} />
          <Bar label="Country fit" value={match.countryFit / 100} />
        </div>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {match.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </details>
    </Card>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular text-muted-foreground">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-[var(--color-accent)]"
        aria-label={label}
      />
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
