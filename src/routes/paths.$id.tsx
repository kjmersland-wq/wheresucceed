import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, Btn, Card, NeedsProfile, ScoreRing, Stat } from "@/components/ui-kit";
import { OCCUPATIONS, analyseProfile, rankCareers } from "@/engine";
import { COUNTRIES } from "@/lib/ui-countries";
import { toPreferenceWeights, toUserProfile } from "@/lib/profile-adapter";
import { fmtEUR } from "@/lib/scoring";
import { useAppState } from "@/lib/store";

/** The path id in the address is the occupation's ISCO-08 code, for example /paths/2512. */
export const Route = createFileRoute("/paths/$id")({
  loader: ({ params }) => {
    const occupation = OCCUPATIONS.find((o) => o.isco === params.id);
    if (!occupation) throw notFound();
    return { title: occupation.title, isco: occupation.isco };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — WhereSucceed` : "Path — WhereSucceed";
    const description = loaderData
      ? `${loaderData.title}: income at year 1, 5 and 10, education cost and time to independence.`
      : "Career path details";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const s = useAppState();
  const profile = useMemo(() => (s?.profile ? toUserProfile(s.profile) : null), [s?.profile]);
  // Same settings as the list on /my-paths, so the score here is the score there.
  const match = useMemo(() => {
    if (!profile || !s) return null;
    return rankCareers(analyseProfile(profile), toPreferenceWeights(s.prefs)).find((m) => m.isco === id) ?? null;
  }, [profile, s, id]);
  // Every country open, so the comparison works whatever the "willing to move" answer is.
  const career = useMemo(() => {
    if (!profile) return null;
    const open = { ...profile, constraints: { ...profile.constraints, willingToMove: "anywhere" as const } };
    return analyseProfile(open).careers.find((c) => c.occupation.isco === id) ?? null;
  }, [profile, id]);

  if (!s) return null;
  if (!s.profile) return <NeedsProfile />;
  if (!match || !career) return null;

  const occupation = career.occupation;
  const best = COUNTRIES.find((c) => c.code === match.bestCountry);
  const byCountry = career.options
    .map((o) => ({ c: COUNTRIES.find((x) => x.code === o.country), year10: o.incomeYear10 }))
    .flatMap((o) => (o.c ? [{ c: o.c, year10: o.year10 }] : []))
    .sort((a, b) => b.year10 - a.year10);
  const max = Math.max(...byCountry.map((a) => a.year10), 1);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 fade-up">
      <Link to="/my-paths" className="text-sm text-muted-foreground hover:text-foreground">← All paths</Link>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={match.matchScore} size={96} />
        <div>
          <h1 className="text-4xl md:text-5xl">{occupation.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">Rank {match.rank} of {OCCUPATIONS.length} for you · ISCO {occupation.isco}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <h3 className="text-lg">Income trajectory · {best?.name ?? match.bestCountry}</h3>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[match.incomeYear1, match.incomeYear5, match.incomeYear10].map((v, i) => (
              <Stat key={i} label={`Year ${[1, 5, 10][i]}`} value={fmtEUR(v)} />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <Stat label="Education" value={`${occupation.educationYears} yrs`} />
            <Stat label="Entry cost" value={match.educationCost ? fmtEUR(match.educationCost) : "Free"} />
            <Stat label="Independent in" value={`~${match.timeToIndependence} yrs`} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg">Why it scores {match.matchScore}</h3>
          <div className="mt-5 space-y-4">
            <Bar label="Interest fit" value={match.breakdown.interests / 100} />
            <Bar label="Skill fit" value={match.breakdown.skills / 100} />
            <Bar label="Values fit" value={match.breakdown.values / 100} />
            <Bar label="Time to independence" value={match.breakdown.feasibility / 100} />
            <Bar label="Country fit" value={match.countryFit / 100} />
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="text-lg">Country comparison · year 10 income</h3>
        <div className="mt-6 space-y-3">
          {byCountry.map((a) => (
            <div key={a.c.code} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-sm">
              <span>{a.c.flag} {a.c.name}</span>
              <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${(a.year10 / max) * 100}%` }} /></div>
              <span className="tabular text-right">{fmtEUR(a.year10)}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg">What shaped this score</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {match.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </Card>
        <Card className="bg-deep text-primary-foreground">
          <div className="text-xs uppercase tracking-wider text-gold">Premium · AI</div>
          <h3 className="mt-2 text-2xl">Future You, at 30</h3>
          <p className="mt-3 text-sm opacity-75">A clear explanation of why {occupation.title.toLowerCase()} fits your profile, and a grounded look at what a typical day looks like ten years in.</p>
          <Btn to="/pricing" variant="accent" className="mt-6">Unlock with Premium</Btn>
        </Card>
      </div>
    </div>
  );
}
