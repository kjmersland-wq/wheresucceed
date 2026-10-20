# Career scoring engine

Pure TypeScript, no AI, no network, no React. The same profile and sliders always give the same ranking.
It lives next to the older `src/lib/scoring.ts` and does not replace it; the app still uses that one.

## Use

```ts
import { analyseProfile, rankCareers, rerank, recommendCareers } from "@/engine";

// One call:
const ranking = recommendCareers(profile, { incomeFocus: 0.5 });

// When sliders will move: analyse once, then re-rank cheaply.
const analysis = analyseProfile(profile);
let ranking = rankCareers(analysis, prefs);
ranking = rerank(analysis, { ...prefs, stayLocal: 1 }, ranking); // adds previousRank / rankChange
```

Each result has `matchScore` (0-100), `incomeYear1/5/10`, `educationCost`, `timeToIndependence`,
`countryFit`, `bestCountry`, a `breakdown` of every component, and plain-language `reasons`.

## How a score is built

`matchScore` is a weighted average of components that are each 0 to 1:

| Component | Rule (see `rules.ts`) |
| --- | --- |
| interests | share of the job's interest tags the user has, lifted off zero by a floor |
| skills | importance-weighted; each level below the job's requirement costs 0.3 |
| values | user's priority weights (normalised) times how well the job delivers each |
| feasibility | 1 if independence arrives within the time horizon, then falls off linearly |
| countryFit | 60% labour demand + 40% income, best country the user would consider |
| income | years 1, 5 and 10 against a 120k cap (only counts when `incomeFocus` > 0) |
| shortEducation | 1 for no education down to 0 at 8 years (only counts when `shortEducation` > 0) |
| remote | the job's `remoteShare` (0-1; only counts when `remoteFriendly` > 0) |

Sliders (each 0 to 1): `incomeFocus`, `shortEducation` and `remoteFriendly` switch their component on;
`stayLocal` lowers the fit of every country except the current one.

## Adjust

- Rule numbers (caps, penalties, how many years to look ahead): `RULES` in `rules.ts`.
- How much each component counts, and how strong each slider is: `BASE_WEIGHTS` and `SLIDER_STRENGTH` in `weights.ts`.
- Countries, income and tuition multipliers, independence income, what "nearby" means: `countries.ts`.
- Occupations (ISCO-08 style, mock numbers): `occupations.ts`. Swap in real data without touching the engine.
