import Anthropic from "@anthropic-ai/sdk";
import type { Generate } from "@/lib/explain/explain";

/** Raised when the model declines the request. The caller treats it as "no explanation". */
export class ModelDeclinedError extends Error {}
/** Raised when no API key is configured. */
export class NotConfiguredError extends Error {}

const MODEL = "claude-opus-5-5";

let client: Anthropic | undefined;
function getClient(): Anthropic {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) throw new NotConfiguredError("ANTHROPIC_API_KEY is not set");
  client ??= new Anthropic({ apiKey, timeout: 45_000, maxRetries: 1 });
  return client;
}

/**
 * The one place the app talks to the model. It sends a fixed system prompt and the
 * facts the engine produced, with no tools and no web access.
 */
export const generateWithClaude: Generate = async ({ system, user }) => {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    // Thinking is always on for this model and counts toward max_tokens; the answer itself is short.
    max_tokens: 3000,
    // A short explanation of numbers it already has does not need deep reasoning.
    output_config: { effort: "low" },
    system,
    messages: [{ role: "user", content: user }],
    // If a safety check declines the request, let the API retry it on its default fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  if (response.stop_reason === "refusal")
    throw new ModelDeclinedError("The model declined the request");

  return response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("\n")
    .trim();
};
