import { z } from "zod";
import { explainRequestSchema } from "@/lib/explain/contract";
import { explainFacts, type Generate } from "@/lib/explain/explain";
import { buildFacts } from "@/lib/explain/facts";
import { ModelDeclinedError, NotConfiguredError, generateWithClaude } from "./anthropic.server";
import { codeKey, isValidPremiumCode } from "./premium.server";
import { createRateLimiter } from "./rate-limit.server";

const MAX_BODY_BYTES = 20_000;

export interface HandlerDeps {
  generate: Generate;
  isPremium: (code: string) => boolean;
  /** Explanations per Premium code. */
  explainLimiter: { allow: (key: string) => boolean };
  /** Code checks per caller, so codes cannot be guessed by trying many. */
  verifyLimiter: { allow: (key: string) => boolean };
}

const defaultDeps: HandlerDeps = {
  generate: generateWithClaude,
  isPremium: (code) => isValidPremiumCode(code),
  explainLimiter: createRateLimiter(30, 60 * 60 * 1000),
  verifyLimiter: createRateLimiter(10, 10 * 60 * 1000),
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Reads a small JSON body, or returns the error response to send. */
async function readJson(request: Request): Promise<{ value: unknown } | { error: Response }> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return { error: json({ error: "too_large" }, 413) };
  try {
    return { value: JSON.parse(text) };
  } catch {
    return { error: json({ error: "bad_request" }, 400) };
  }
}

const callerKey = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

/** POST /api/explain: a grounded explanation for one career, for Premium users only. */
export async function handleExplain(
  request: Request,
  deps: HandlerDeps = defaultDeps,
): Promise<Response> {
  const body = await readJson(request);
  if ("error" in body) return body.error;

  const parsed = explainRequestSchema.safeParse(body.value);
  if (!parsed.success) return json({ error: "bad_request" }, 400);
  const { code, isco, profile, prefs } = parsed.data;

  if (!deps.isPremium(code)) return json({ error: "premium_required" }, 403);
  if (!deps.explainLimiter.allow(codeKey(code))) return json({ error: "rate_limited" }, 429);

  // The numbers come from our own engine, never from the browser: the model is given
  // what the engine produces for this profile, whatever the client claims.
  const facts = buildFacts({ isco, profile, prefs });
  if (!facts) return json({ error: "not_found" }, 404);

  try {
    const result = await explainFacts(facts, deps.generate);
    if (!result.ok) return json({ error: "unusable" }, 502);
    return json({ explanation: result.text });
  } catch (error) {
    if (error instanceof NotConfiguredError) return json({ error: "unavailable" }, 503);
    if (error instanceof ModelDeclinedError) return json({ error: "declined" }, 422);
    // Log the kind of failure only: never the request, the profile or the key.
    console.error("explain failed:", error instanceof Error ? error.name : "unknown error");
    return json({ error: "unavailable" }, 503);
  }
}

const verifySchema = z.object({ code: z.string().min(1).max(200) }).strict();

/** POST /api/premium: does this access code unlock Premium? */
export async function handleVerify(
  request: Request,
  deps: HandlerDeps = defaultDeps,
): Promise<Response> {
  if (!deps.verifyLimiter.allow(callerKey(request))) return json({ error: "rate_limited" }, 429);
  const body = await readJson(request);
  if ("error" in body) return body.error;
  const parsed = verifySchema.safeParse(body.value);
  if (!parsed.success) return json({ error: "bad_request" }, 400);
  return json({ valid: deps.isPremium(parsed.data.code) });
}
