import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { COMPANY, LEGAL_UPDATED } from "@/lib/company";

/** The shared frame for the legal pages: title, date, who we are, and readable body text. */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 fade-up">
      <p className="text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
      <h1 className="mt-1 text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{intro}</p>
      <div className="mt-10 space-y-10 text-[15px] leading-relaxed">{children}</div>
      <aside className="mt-14 rounded-2xl border border-border bg-card p-5 text-sm shadow-soft">
        <div className="font-medium">{COMPANY.name}</div>
        <div className="mt-1 text-muted-foreground">
          Org.nr. {COMPANY.orgNumber} · {COMPANY.city}, {COMPANY.country}
        </div>
        <div className="mt-1">
          Questions? Write to{" "}
          <a className="text-accent underline-offset-4 hover:underline" href={`mailto:${COMPANY.supportEmail}`}>
            {COMPANY.supportEmail}
          </a>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link to="/refund" className="hover:text-foreground">Refunds</Link>
        </div>
      </aside>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

export function Mail() {
  return (
    <a className="text-accent underline-offset-4 hover:underline" href={`mailto:${COMPANY.supportEmail}`}>
      {COMPANY.supportEmail}
    </a>
  );
}

/** A small two-or-three column table that stays readable on a phone. */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
