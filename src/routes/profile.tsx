import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, NeedsProfile } from "@/components/ui-kit";
import { COUNTRIES, INTERESTS, PATHS, SKILLS, VALUES } from "@/lib/data";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — WhereSucceed" },
      { name: "description", content: "Your saved mapping — interests, skills, values and constraints — and how it shapes your ranked paths." },
      { property: "og:title", content: "My profile — WhereSucceed" },
      { property: "og:description", content: "Your saved mapping and the thread of how your suggestions evolve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const SITUATION: Record<string, string> = { school: "In school", student: "Studying", working: "Working", searching: "Figuring it out" };
const MOBILITY: Record<string, string> = { stay: "Stay home", region: "Nearby countries", anywhere: "Anywhere" };
const HORIZON: Record<string, string> = { fast: "Earn soon", balanced: "Balanced", long: "Invest long-term" };
const BUDGET: Record<string, string> = { low: "Tight", medium: "Moderate", high: "Flexible" };

function ProfilePage() {
  const s = useAppState();
  if (!s) return null;
  if (!s.profile) return <NeedsProfile />;
  const p = s.profile;
  const country = COUNTRIES.find((c) => c.code === p.home)!;
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Your mapping</p>
          <h1 className="mt-1 text-4xl">This is you, today.</h1>
        </div>
        <Btn to="/onboarding" variant="outline">Edit mapping</Btn>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg">Interests</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.interests.map((i) => (
              <span key={i} className="rounded-full bg-accent-soft px-3 py-1 text-sm">{INTERESTS.find((x) => x.id === i)!.label}</span>
            ))}
          </div>
          <h3 className="mt-6 text-lg">Values, in order</h3>
          <ol className="mt-3 space-y-1 text-sm">
            {p.values.map((v, i) => (
              <li key={v}><span className="mr-2 font-serif text-accent">{i + 1}</span>{VALUES.find((x) => x.id === v)!.label}</li>
            ))}
          </ol>
        </Card>
        <Card>
          <h3 className="text-lg">Skills</h3>
          <div className="mt-4 space-y-2">
            {SKILLS.map((sk) => (
              <div key={sk.id} className="flex items-center gap-3 text-sm">
                <span className="w-36">{sk.label}</span>
                <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2 w-6 rounded-full ${n <= p.skills[sk.id] ? "bg-accent" : "bg-secondary"}`} />)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="text-lg">Practical constraints</h3>
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
          This mapping is the input behind your ranked paths — change it and the ranking changes with it.
          Every time you edit your mapping, your paths are re-scored and a snapshot is saved here, so you can
          follow how your direction has developed.
        </p>
        {s.thread.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Finish your first mapping and your first snapshot appears here.</p>
        ) : (
          <div className="mt-6 border-l border-border pl-6">
            {[...s.thread].reverse().map((t, i) => (
              <div key={i} className="relative pb-8">
                <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                <div className="text-xs text-muted-foreground">
                  {new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} · {t.note}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.top.map((x) => (
                    <span key={x.id} className="rounded-full border border-border bg-card px-3 py-1 text-sm">
                      {PATHS.find((pp) => pp.id === x.id)?.title} <span className="font-serif text-accent">{x.score}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12 text-center">
        <Btn to="/my-paths" variant="ghost">See my paths →</Btn>
      </div>
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
