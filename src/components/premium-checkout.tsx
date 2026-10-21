import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { getStripe, getStripeEnvironment, PREMIUM_PRICE_ID } from "@/lib/stripe";
import { createCheckoutSession } from "@/utils/payments.functions";

/** Stripe's own payment form, shown inline on the page. */
export function PremiumCheckout() {
  const fetchClientSecret = useCallback(async () => {
    const result = await createCheckoutSession({
      data: {
        priceId: PREMIUM_PRICE_ID,
        returnUrl: `${window.location.origin}/pricing?checkout=done`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe did not return a client secret");
    return result.clientSecret;
  }, []);

  return (
    <div id="checkout" className="overflow-hidden rounded-2xl">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        Production checkout is not configured yet.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-gold/40 bg-gold/15 px-4 py-2 text-center text-sm">
        All payments made in the preview are in test mode.{" "}
        <a href="https://docs.lovable.dev/features/payments#test-and-live-environments" target="_blank" rel="noopener noreferrer" className="font-medium underline">
          Read more
        </a>
      </div>
    );
  }
  return null;
}
