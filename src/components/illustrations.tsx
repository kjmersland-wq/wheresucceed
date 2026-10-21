/**
 * Three small, friendly illustrations for the home page. They are inline SVG, so they cost
 * no extra requests, scale to any screen and follow the site's colours.
 */
const base = "h-auto w-full";

/** "Map yourself": a smiling person with the things that make them who they are. */
export function MapYourselfArt() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="A smiling person surrounded by their interests, skills and values" className={base}>
      <rect width="320" height="200" rx="20" fill="var(--color-accent-soft)" />
      <circle cx="160" cy="92" r="34" fill="var(--color-card)" />
      <circle cx="148" cy="86" r="3.5" fill="var(--color-primary)" />
      <circle cx="172" cy="86" r="3.5" fill="var(--color-primary)" />
      <path d="M146 102 Q160 116 174 102" fill="none" stroke="var(--color-primary)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M126 170 Q160 126 194 170 Z" fill="var(--color-card)" />
      <g fontFamily="inherit" fontSize="12" fontWeight="600">
        <rect x="22" y="30" width="86" height="28" rx="14" fill="var(--color-card)" />
        <text x="65" y="48" textAnchor="middle" fill="var(--color-primary)">Curious</text>
        <rect x="214" y="26" width="84" height="28" rx="14" fill="var(--color-accent)" />
        <text x="256" y="44" textAnchor="middle" fill="var(--color-accent-foreground)">Creative</text>
        <rect x="14" y="120" width="96" height="28" rx="14" fill="var(--color-accent)" />
        <text x="62" y="138" textAnchor="middle" fill="var(--color-accent-foreground)">Loves people</text>
        <rect x="226" y="118" width="80" height="28" rx="14" fill="var(--color-card)" />
        <text x="266" y="136" textAnchor="middle" fill="var(--color-primary)">Freedom</text>
      </g>
      <path d="M76 58 Q104 70 124 84 M238 54 Q206 66 192 84 M70 118 Q100 112 126 104 M228 116 Q204 110 194 104" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
    </svg>
  );
}

/** "See ranked paths": steps that climb towards the best match. */
export function RankedPathsArt() {
  const rows = [
    { y: 28, w: 210, score: 92, label: "Best match" },
    { y: 78, w: 170, score: 84, label: "" },
    { y: 128, w: 130, score: 76, label: "" },
  ];
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Three career paths ranked by match score, the best one on top" className={base}>
      <rect width="320" height="200" rx="20" fill="var(--color-accent-soft)" />
      {rows.map((r, i) => (
        <g key={r.y}>
          <rect x="24" y={r.y} width={r.w} height="40" rx="20" fill={i === 0 ? "var(--color-accent)" : "var(--color-card)"} />
          <circle cx="44" cy={r.y + 20} r="12" fill={i === 0 ? "var(--color-card)" : "var(--color-accent-soft)"} />
          <text x="44" y={r.y + 24} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-primary)">{i + 1}</text>
          <rect x="66" y={r.y + 12} width={r.w - 110} height="7" rx="3.5" fill={i === 0 ? "var(--color-card)" : "var(--color-border)"} opacity={i === 0 ? 0.9 : 1} />
          <rect x="66" y={r.y + 24} width={(r.w - 110) * 0.6} height="5" rx="2.5" fill={i === 0 ? "var(--color-card)" : "var(--color-border)"} opacity={i === 0 ? 0.6 : 0.7} />
          <text x={r.w + 48} y={r.y + 26} fontSize="17" fontWeight="700" fill="var(--color-primary)" fontFamily="inherit">{r.score}</text>
        </g>
      ))}
    </svg>
  );
}

/** "Compare where": the same path in different places, each with its own numbers. */
export function CompareCountriesArt() {
  const cards = [
    { x: 20, code: "NO", h: 70 },
    { x: 116, code: "DE", h: 96 },
    { x: 212, code: "US", h: 118 },
  ];
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="The same path compared across three countries, with income bars of different heights" className={base}>
      <rect width="320" height="200" rx="20" fill="var(--color-accent-soft)" />
      {cards.map((c, i) => (
        <g key={c.x}>
          <rect x={c.x} y="24" width="88" height="152" rx="16" fill="var(--color-card)" />
          <text x={c.x + 44} y="54" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-primary)">{c.code}</text>
          <rect x={c.x + 24} y={160 - c.h} width="40" height={c.h} rx="8" fill="var(--color-accent)" opacity={0.45 + i * 0.27} />
        </g>
      ))}
    </svg>
  );
}
