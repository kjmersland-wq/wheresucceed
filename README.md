# WhereSucceed

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://wheresucceed.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/faebe2c2-792e-4941-babf-ed83a0d02cb8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Premium: AI explanations

Premium adds an "Explain this path" button to each card on `/dashboard`. The free app contains no AI: the button, the `/api/explain` route and the model call only exist behind Premium.

How it is built:

- **What the model sees.** Only the facts the scoring engine produced for one career, plus the person's own mapping and slider settings (`src/lib/explain/facts.ts`). The browser sends the profile and the career code; the server recomputes every number with the same engine and gives the model those, so a client cannot hand it made-up scores. The request schema (`contract.ts`) allows only enums and bounded numbers, so there is no free text to carry an instruction.
- **Grounding.** The system prompt tells the model to use only the data and copy numbers exactly. The answer is then checked mechanically: any number that is not in the data (allowing normal rounding of money) gets one retry, and if it still fails nothing is shown (`grounding.ts`, `explain.ts`).
- **Premium check.** There are no accounts or payments yet, so Premium is switched on with an access code. The server checks the code on every request (`src/server/premium.server.ts`), with a per-code rate limit on explanations and a limit on code attempts. To replace it with real billing, change `isValidPremiumCode`.
- **Model.** `claude-opus-5-5` through the official `@anthropic-ai/sdk`, with no tools and no web access (`src/server/anthropic.server.ts`).

Server environment variables:

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Key for the model call. Without it the button shows a polite "not available" message. |
| `PREMIUM_ACCESS_CODES` | Comma-separated access codes, each at least 12 characters (use long random ones). |

Premium codes are entered on `/pricing`.
