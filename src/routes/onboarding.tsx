import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Chip } from "@/components/ui-kit";
import { COUNTRIES, INTERESTS, SKILLS, VALUES, type Interest, type Skill, type Value } from "@/lib/data";
import { DEFAULT_PREFS, rankPaths, type Profile } from "@/lib/scoring";
import { setState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Your mapping — WhereSucceed" },
      { name: "description", content: "A short, structured profile of your interests, skills, values and constraints." },
      { property: "og:title", content: "Map yourself — WhereSucceed" },
      { property: "og:description", content: "A short, structured profile that powers your ranked paths." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["Interests", "Skills & strengths", "Values & priorities", "Practical constraints", "Summary"];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Profile>({
    interests: [],
    skills: { math: 0, communication: 0, creativity: 0, practical: 0, leadership: 0, focus: 0 },
    values: VALUES.map((v) => v.id),
    maxEduYears: 4, budget: "medium", mobility: "region", home: "NO", horizon: "balanced", situation: "school",
  });
  const up = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }));
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const pick = (k: string) => setPicked((x) => new Set(x).add(k));
  const valid = [
    p.interests.length >= 1,
    Object.values(p.skills).every((v) => v >= 1),
    p.values.length === VALUES.length,
    ["situation", "horizon", "mobility"].every((k) => picked.has(k)),
    true,
  ];
  const canNext = valid[step];
  const hint = ["Pick at least one interest", "Rate every skill to continue", "", "Answer each question to continue", ""][step];

  const finish = () => {
    const top = rankPaths(p, DEFAULT_PREFS).slice(0, 3).map((r) => ({ id: r.path.id, score: r.score }));
    setState((s) => ({ ...s, profile: p, thread: [...s.thread, { date: new Date().toISOString(), top, note: s.profile ? "Mapping updated" : "First mapping" }] }));
    nav({ to: "/my-paths" });
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-10">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Step {step + 1} of {STEPS.length}</span><span>{STEPS[step]}</span></div>
        <div className="mt-2 flex gap-1.5">{STEPS.map((_, i) => <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-accent" : "bg-border")} />)}</div>
      </div>

      <div key={step} className="fade-up">
        {step === 0 && (
          <Q title="What pulls you in?" sub="Pick up to four. Your first instinct is usually the honest one.">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const on = p.interests.includes(i.id);
                return <Chip key={i.id} active={on} onClick={() => up({ interests: on ? p.interests.filter((x) => x !== i.id) : p.interests.length < 4 ? [...p.interests, i.id as Interest] : p.interests })}>{i.label}</Chip>;
              })}
            </div>
          </Q>
        )}
        {step === 1 && (
          <Q title="Where are you strong today?" sub="Be honest — this is about fit, not judgement.">
            <div className="space-y-6">
              {SKILLS.map((s) => (
                <div key={s.id}>
                  <div className="mb-2 flex justify-between text-sm"><span>{s.label}</span><span className="text-muted-foreground">{["Tap to rate", "Not yet", "Some", "Decent", "Strong", "Excellent"][p.skills[s.id]]}</span></div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" aria-label={`${s.label} ${n}`} onClick={() => up({ skills: { ...p.skills, [s.id as Skill]: n } })} className={cn("h-9 rounded-lg border transition-all", n <= p.skills[s.id] ? "border-accent bg-accent" : "border-border bg-card hover:border-foreground/30")} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Q>
        )}
        {step === 2 && (
          <Q title="What matters most to you?" sub="Order from most to least important.">
            <ol className="space-y-2">
              {p.values.map((v, i) => (
                <li key={v} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
                  <span className="w-5 font-serif text-accent">{i + 1}</span>
                  <span className="flex-1">{VALUES.find((x) => x.id === v)!.label}</span>
                  <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => up({ values: swap(p.values, i, i - 1) })} className="rounded-md px-2 text-muted-foreground hover:text-foreground disabled:opacity-20">↑</button>
                  <button type="button" aria-label="Move down" disabled={i === p.values.length - 1} onClick={() => up({ values: swap(p.values, i, i + 1) })} className="rounded-md px-2 text-muted-foreground hover:text-foreground disabled:opacity-20">↓</button>
                </li>
              ))}
            </ol>
          </Q>
        )}
        {step === 3 && (
          <Q title="Your real-life situation" sub="This keeps your paths realistic.">
            <Label>Right now I'm…</Label>
            <Options value={picked.has("situation") ? p.situation : ("" as Profile["situation"])} onChange={(v) => { up({ situation: v }); pick("situation"); }} opts={[["school", "In school"], ["student", "Studying"], ["working", "Working"], ["searching", "Figuring it out"]]} />
            <Label>Home country</Label>
            <div className="flex flex-wrap gap-2">{COUNTRIES.map((c) => <Chip key={c.code} active={p.home === c.code} onClick={() => up({ home: c.code })}>{c.flag} {c.name}</Chip>)}</div>
            <Label>Willing to move?</Label>
            <Options value={picked.has("mobility") ? p.mobility : ("" as Profile["mobility"])} onChange={(v) => { up({ mobility: v }); pick("mobility"); }} opts={[["stay", "Stay home"], ["region", "Nearby countries"], ["anywhere", "Anywhere"]]} />
            <Label>Time horizon</Label>
            <Options value={picked.has("horizon") ? p.horizon : ("" as Profile["horizon"])} onChange={(v) => { up({ horizon: v }); pick("horizon"); }} opts={[["fast", "Earn soon"], ["balanced", "Balanced"], ["long", "Invest long-term"]]} />
            <Label>Max years of education: <span className="font-serif text-accent">{p.maxEduYears}</span></Label>
            <input type="range" min={0} max={7} value={p.maxEduYears} onChange={(e) => up({ maxEduYears: +e.target.value })} className="w-full accent-[var(--color-accent)]" aria-label="Max years of education" />
            <Label>Budget for education</Label>
            <Options value={p.budget} onChange={(v) => up({ budget: v })} opts={[["low", "Tight"], ["medium", "Moderate"], ["high", "Flexible"]]} />
          </Q>
        )}
        {step === 4 && (
          <Q title="Here's your mapping" sub="Check it over. You can change anything later.">
            <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
              <Row label="Interests" onEdit={() => setStep(0)}>{p.interests.map((i) => INTERESTS.find((x) => x.id === i)!.label).join(" · ")}</Row>
              <Row label="Top strengths" onEdit={() => setStep(1)}>{[...SKILLS].sort((a, b) => p.skills[b.id] - p.skills[a.id]).slice(0, 3).map((x) => `${x.label} ${p.skills[x.id]}/5`).join(" · ")}</Row>
              <Row label="Priorities" onEdit={() => setStep(2)}>{p.values.slice(0, 3).map((v, i) => `${i + 1}. ${VALUES.find((x) => x.id === v)!.label}`).join("  ")}</Row>
              <Row label="Situation" onEdit={() => setStep(3)}>{[COUNTRIES.find((c) => c.code === p.home)!.flag + " " + COUNTRIES.find((c) => c.code === p.home)!.name, { stay: "Staying home", region: "Nearby countries", anywhere: "Open to anywhere" }[p.mobility], { fast: "Earn soon", balanced: "Balanced", long: "Long-term" }[p.horizon], `≤ ${p.maxEduYears} yrs study`].join(" · ")}</Row>
            </div>
          </Q>
        )}
      </div>

      <div className="mt-12 flex justify-between">
        <Btn variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>← Back</Btn>
        {hint && !canNext && <span className="hidden self-center text-xs text-muted-foreground sm:block">{hint}</span>}
        {step < STEPS.length - 1 ? <Btn onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continue</Btn> : <Btn onClick={finish}>See my paths →</Btn>}
      </div>
    </div>
  );
}

function swap<T>(a: T[], i: number, j: number) { const b = [...a]; const t = b[i]!; b[i] = b[j]!; b[j] = t; return b as Value[] & T[]; }
function Q({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return <div><h1 className="text-3xl md:text-4xl">{title}</h1>{sub && <p className="mt-2 text-muted-foreground">{sub}</p>}<div className="mt-8">{children}</div></div>;
}
function Label({ children }: { children: React.ReactNode }) { return <div className="mb-3 mt-7 text-sm font-medium first:mt-0">{children}</div>; }
function Options<T extends string>({ value, onChange, opts }: { value: T; onChange: (v: T) => void; opts: [T, string][] }) {
  return <div className="flex flex-wrap gap-2">{opts.map(([v, l]) => <Chip key={v} active={value === v} onClick={() => onChange(v)}>{l}</Chip>)}</div>;
}
function Row({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="w-28 shrink-0 text-xs uppercase tracking-wider text-muted-foreground pt-0.5">{label}</div>
      <div className="flex-1 text-sm">{children}</div>
      <button type="button" onClick={onEdit} className="text-xs text-accent hover:underline">Edit</button>
    </div>
  );
}
