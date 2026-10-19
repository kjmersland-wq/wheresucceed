import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Btn, Card, NeedsProfile } from "@/components/ui-kit";
import { DEFAULT_PREFERENCES, OCCUPATIONS, recommendCareers } from "@/engine";
import { COUNTRIES, INTERESTS, PATHS, SKILLS, VALUES } from "@/lib/data";
import { toUserProfile } from "@/lib/profile-adapter";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — WhereSucceed" },
      {
        name: "description",
        content:
          "Your saved mapping — interests, skills, values and constraints — and how it shapes your ranked paths.",
      },
      { property: "og:title", content: "My profile — WhereSucceed" },
      {
        property: "og:description",
        content: "Your saved mapping and the thread of how your suggestions evolve.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const SITUATION: Record<string, string> = {
  school: "In school",
  student: "Studying",
  working: "Working",
  searching: "Figuring it out",
};
const MOBILITY: Record<string, string> = {
  stay: "Stay home",
  region: "Nearby countries",
  anywhere: "Anywhere",
};
const HORIZON: Record<string, string> = {
  fast: "Earn soon",
  balanced: "Balanced",
  long: "Invest long-term",
};
const BUDGET: Record<string, string> = { low: "Tight", medium: "Moderate", high: "Flexible" };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

/** Thread entries saved by the first version used PATHS ids; newer ones use ISCO codes. */
function pathTitle(id: string): string {
  return (
    OCCUPATIONS.find((o) => o.isco === id)?.title ?? PATHS.find((p) => p.id === id)?.title ?? id
  );
}

function ProfilePage() {
  const s = useAppState();
  const profile = s?.profile ?? null;
  const top = useMemo(
    () =>
      profile ? recommendCareers(toUserProfile(profile), DEFAULT_PREFERENCES).slice(0, 3) : [],
    [profile],
  );
  if (!s) return null;
  if (!profile) return <NeedsProfile />;
  const p = profile;
  const country = COUNTRIES.find((c) => c.code === p.home)!;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Your mapping{s.updatedAt ? ` · last saved ${formatDate(s.updatedAt)}` : ""}
          </p>
          <h1 className="mt-1 text-4xl">This is you, today.</h1>
        </div>
        <Btn to="/onboarding" variant="outline">
          Edit mapping
        </Btn>
      </div>

      <Card className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg">Your best matches right now</h3>
          <Link to="/dashboard" className="text-sm text-accent underline-offset-4 hover:underline">
            See all ranked paths →
          </Link>
        </div>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {top.map((m) => (
            <li key={m.isco} className="rounded-xl border border-border bg-background px-4 py-3">
              <div className="text-xs text-muted-foreground tabular">Rank {m.rank}</div>
              <div className="mt-0.5 leading-snug">{m.title}</div>
              <div className="mt-1 font-serif text-xl text-accent tabular">{m.matchScore}</div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <SectionHead title="Interests" step={0} />
          <div className="mt-4 flex flex-wrap gap-2">
            {p.interests.map((i) => (
              <span key={i} className="rounded-full bg-accent-soft px-3 py-1 text-sm">
                {INTERESTS.find((x) => x.id === i)!.label}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <SectionHead title="Values, in order" step={2} />
          </div>
          <ol className="mt-3 space-y-1 text-sm">
            {p.values.map((v, i) => (
              <li key={v}>
                <span className="mr-2 font-serif text-accent">{i + 1}</span>
                {VALUES.find((x) => x.id === v)!.label}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <SectionHead title="Skills" step={1} />
          <div className="mt-4 space-y-2">
            {SKILLS.map((sk) => (
              <div key={sk.id} className="flex items-center gap-3 text-sm">
                <span className="w-36">{sk.label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-2 w-6 rounded-full ${n <= p.skills[sk.id] ? "bg-accent" : "bg-secondary"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <SectionHead title="Practical constraints" step={3} />
        <div className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Fact k="Current situation" v={SITUATION[p.situation]} />
          <Fact k="Home country" v={`${country.flag} ${country.name}`} />
          <Fact k="Willing to move" v={MOBILITY[p.mobility]} />
          <Fact k="Time horizon" v={HORIZON[p.horizon]} />
          <Fact k="Max years of education" v={`${p.maxEduYears} years`} />
          <Fact k="Education budget" v={BUDGET[p.budget]} />
        </div>
      </Card>

      <section className="mt-14">
        <h2 className="text-2xl">Your thread</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Your mapping is what WhereSucceed uses to generate your suggestions, and it is how they
          improve over time: change something and your paths are re-scored, and a snapshot is saved
          here so you can follow how your direction develops. It is stored only on this device.
        </p>
        {s.thread.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Finish your first mapping and your first snapshot appears here.
          </p>
        ) : (
          <div className="mt-6 border-l border-border pl-6">
            {[...s.thread].reverse().map((t, i) => (
              <div key={`${t.date}-${i}`} className="relative pb-8">
                <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <div className="text-xs text-muted-foreground">
                  {formatDate(t.date)} · {t.note}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.top.map((x) => (
                    <span
                      key={x.id}
                      className="rounded-full border border-border bg-card px-3 py-1 text-sm"
                    >
                      {pathTitle(x.id)} <span className="font-serif text-accent">{x.score}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12 text-center">
        <Btn to="/dashboard" variant="ghost">
          See my paths →
        </Btn>
      </div>
    </div>
  );
}

/** Section title with a link that opens the mapping at that step, answers filled in. */
function SectionHead({ title, step }: { title: string; step: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-lg">{title}</h3>
      <Link
        to="/onboarding"
        search={{ step }}
        className="text-xs text-accent underline-offset-4 hover:underline"
        aria-label={`Edit ${title.toLowerCase()}`}
      >
        Edit
      </Link>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string | undefined }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-1">{v ?? "—"}</div>
    </div>
  );
}
