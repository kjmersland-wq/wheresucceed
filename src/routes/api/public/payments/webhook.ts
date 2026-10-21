import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function fields(subscription: any) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  return {
    status: subscription.status as string,
    product_id: String(item?.price?.product ?? ""),
    price_id: String(priceId ?? ""),
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  };
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }
  const db = await admin();
  await db.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: String(subscription.customer),
      environment: env,
      ...fields(subscription),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function markCanceled(subscription: any, env: StripeEnv) {
  const db = await admin();
  await db
    .from("subscriptions")
    .update({ ...fields(subscription), status: "canceled" })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
              await upsertSubscription(event.data.object, env);
              break;
            case "customer.subscription.deleted":
              await markCanceled(event.data.object, env);
              break;
            default:
              break;
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e instanceof Error ? e.message : e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
