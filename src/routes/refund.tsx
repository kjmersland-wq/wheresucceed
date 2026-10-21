import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Mail, Section, UL } from "@/components/legal";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — WhereSucceed" },
      {
        name: "description",
        content:
          "How refunds work for WhereSucceed Premium: a 14-day money-back window, how to ask, and how Stripe processes it.",
      },
      { property: "og:title", content: "Refund Policy — WhereSucceed" },
      { property: "og:description", content: "Refund rules for WhereSucceed Premium." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Refund,
});

function Refund() {
  return (
    <LegalPage
      title="Refund Policy"
      intro="If Premium is not right for you, we will give your money back. Here is how it works."
    >
      <Section title="1. Our refund rules">
        <UL>
          <li>
            <strong>First payment: 14 days.</strong> Ask for a refund within 14 days of your first
            Premium payment and you get a full refund. You do not need to give a reason.
          </li>
          <li>
            <strong>Renewals: 7 days.</strong> Ask for a refund within 7 days of a renewal charge
            and you get a full refund of that charge.
          </li>
          <li>
            <strong>Cancelling.</strong> You can cancel at any time. Cancelling stops future
            charges, and Premium stays active until the end of the period you have paid for. We do
            not refund part of a month that has already started, except as above.
          </li>
          <li>
            <strong>If we shut down Premium</strong>, you get a full refund of the time you have
            paid for but not used.
          </li>
        </UL>
      </Section>

      <Section title="2. How to ask for a refund">
        <p>
          Email <Mail /> from the address you used to buy Premium and include the order or
          receipt number from your payment confirmation email. We reply within 5 business days.
        </p>
      </Section>

      <Section title="3. Refunds through Stripe">
        <p>
          Paid subscriptions are not open yet. When paid Premium launches, payments and refunds
          will be processed through Stripe. Approved refunds go back to the original card or
          payment method. Your bank determines when the refund appears. Any tax collected on a
          refunded purchase is included in the refund.
        </p>
      </Section>

      <Section title="4. Your legal rights">
        <p>
          If you are a consumer in the EU/EEA you normally have a 14-day right to withdraw from an
          online purchase. For digital services that start right away you can agree to start
          immediately, which can affect that right. We grant the 14-day refund above in any case,
          so using Premium straight away does not cost you it. This policy does not limit any
          mandatory consumer rights you have under the law where you live.
        </p>
        <p>
          Refunds may be declined where there is evidence of abuse or fraud, such as repeatedly
          buying and refunding. See also our{" "}
          <Link to="/terms" className="text-accent underline-offset-4 hover:underline">Terms of Service</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
