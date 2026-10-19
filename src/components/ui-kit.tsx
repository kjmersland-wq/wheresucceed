import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/brand/logo-horizontal-light.svg.asset.json";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex shrink-0 items-center" aria-label="WhereSucceed home">
            <img src={logo.url} alt="WhereSucceed" width={820} height={160} className="h-auto w-40 sm:w-52" />
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {[
              { to: "/my-paths", l: "My paths" },
              { to: "/profile", l: "Profile" },
              { to: "/pricing", l: "Pricing" },
            ].map((n) => (
                <Link key={n.to} to={n.to} className="rounded-full px-2 py-1.5 text-xs text-muted-foreground transition hover:text-foreground sm:px-3 sm:text-sm" activeProps={{ className: "text-foreground bg-secondary" }}>
                {n.l}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 WhereSucceed · wheresucceed.com</span>
          <span>Recommendations are calculated from transparent rules and labour-market estimates.</span>
        </div>
      </footer>
    </div>
  );
}

export function Btn({ to, children, variant = "primary", className, onClick, type, disabled }: { to?: string; children: ReactNode; variant?: "primary" | "ghost" | "accent" | "outline"; className?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none",
    variant === "primary" && "bg-primary text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-px",
    variant === "accent" && "bg-accent text-accent-foreground hover:brightness-105",
    variant === "outline" && "border border-border bg-card hover:border-foreground/30",
    variant === "ghost" && "text-muted-foreground hover:text-foreground",
    className,
  );
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.2,0.7,0.2,1)" }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-serif text-lg tabular">{score}</span>
    </div>
  );
}

export function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{label}</span><span className="tabular">{Math.round(value * 100)}%</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${value * 100}%` }} /></div>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-xl tabular">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border/70 bg-card p-6 shadow-soft", className)}>{children}</div>;
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-full border px-4 py-2 text-sm transition-all", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30")}>
      {children}
    </button>
  );
}

export function NeedsProfile() {
  return (
    <div className="mx-auto max-w-md px-5 py-28 text-center fade-up">
      <h1 className="text-3xl">Let's map you first</h1>
      <p className="mt-3 text-muted-foreground">Your paths are calculated from your profile. It takes about four minutes.</p>
      <Btn to="/onboarding" className="mt-8">Start my mapping</Btn>
    </div>
  );
}
