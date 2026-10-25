/**
 * TEMPORARY: payments paused while the company relocates to Poland.
 * Reopening planned for November/December 2026.
 *
 * To reopen: set this to `false` (one change). The banner disappears and all
 * purchase buttons come back. Then delete this file, the <PaymentsPausedBanner />
 * in src/components/ui-kit.tsx, and the paused branches in src/routes/pricing.tsx.
 */
export const PAYMENTS_PAUSED = true;

export const PAYMENTS_PAUSED_MESSAGE =
  "New purchases and subscriptions are temporarily paused while we relocate to Poland and set up our new company. Existing users continue as normal. We will reopen in November/December 2026.";
