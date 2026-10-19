import { findUngroundedNumbers } from "./grounding";
import { RETRY_NOTE, SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import type { ExplainFacts } from "./facts";

/** Sends the model a system prompt and a user turn, and returns its text. Supplied by the server. */
export type Generate = (input: { system: string; user: string }) => Promise<string>;

export type ExplainResult =
  { ok: true; text: string } | { ok: false; reason: "ungrounded" | "empty" };

const MAX_WORDS = 160;

/**
 * Asks for an explanation and checks it. A text with a number that is not in the facts
 * gets one more try with a reminder; if that fails too, nothing is shown rather than
 * something that might be made up.
 */
export async function explainFacts(
  facts: ExplainFacts,
  generate: Generate,
): Promise<ExplainResult> {
  const user = buildUserMessage(facts);

  for (const attempt of [0, 1]) {
    const text = clean(
      await generate({
        system: SYSTEM_PROMPT,
        user: attempt === 0 ? user : `${user}\n\n${RETRY_NOTE}`,
      }),
    );
    if (!text) return { ok: false, reason: "empty" };
    if (text.split(/\s+/).length > MAX_WORDS) continue;
    if (findUngroundedNumbers(text, facts).length === 0) return { ok: true, text };
  }
  return { ok: false, reason: "ungrounded" };
}

/** Trims, drops markdown emphasis and any leftover tags, and keeps the paragraph breaks. */
function clean(text: string): string {
  return text
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/[*_`#]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
