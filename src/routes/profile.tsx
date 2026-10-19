import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, NeedsProfile } from "@/components/ui-kit";
import { COUNTRIES, INTERESTS, PATHS, SKILLS, VALUES } from "@/lib/data";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — WhereSucceed" },
      { name: "description", content: "Your mapping and how your suggestions have evolved over time." },
      { property: "og:title", content: "My profile — WhereSucceed" },
      { property: "og:description", content: "Your mapping and your evolving thread of suggestions." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const s = useAppState();
  if (!s) return null;
  if (!s.profile) return <NeedsProfile />;
  const p = s.profile;
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">Your mapping</p><h1 className="mt-1 text-4xl">This is you, today.</h1></div>
        <Btn to="/onboarding" variant="outline">Update my mapping</Btn>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg">Interests</h3>
          <div className="mt-4 flex flex-wrap gap-2">{p.interests.map((i) => <span key={i} className="rounded-full bg-accent-soft px-3 py-1 text-sm">{INTERESTS.find((x) => x.id === i)!.label}</span>)}</div>
          <h3 className="mt-6 text-lg">Values, in order</h3>
          <ol className="mt-3 space-y-1 text-sm">{p.values.map((v, i) => <li key={v}><span className="mr-2 font-serif text-accent">{i + 1}</span>{VALUES.find((x) => x.id === v)!.label}</li>)}</ol>
        </Card>
        <Card>
          <h3 className="text-lg">Skills</h3>
          <div className="mt-4 space-y-2">{SKILLS.map((sk) => (
            <div key={sk.id} className="flex items-center gap-3 text-sm"><span className="w-36">{sk.label}</span><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-2 w-6 rounded-full ${n <= p.skills[sk.id] ? "bg-accent" : "bg-secondary"}`} />)}</div></div>
          ))}</div>
          <p className="mt-6 text-sm text-muted-foreground">Based in {COUNTRIES.find((c) => c.code === p.home)!.name} · up to {p.maxEduYears} years of education · {p.mobility === "stay" ? "staying home" : p.mobility === "region" ? "open to nearby countries" : "open to anywhere"}</p>
        </Card>
      </div>
      <h2 className="mt-14 text-2xl">Your thread</h2>
      <p className="mt-1 text-sm text-muted-foreground">Each time you update your mapping, your suggestions get sharper.</p>
      <div className="mt-6 border-l border-border pl-6">
        {[...s.thread].reverse().map((t, i) => (
          <div key={i} className="relative pb-8">
            <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
            <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} · {t.note}</div>
            <div className="mt-2 flex flex-wrap gap-2">{t.top.map((x) => <span key={x.id} className="rounded-full border border-border bg-card px-3 py-1 text-sm">{PATHS.find((pp) => pp.id === x.id)?.title} <span className="font-serif text-accent">{x.score}</span></span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
