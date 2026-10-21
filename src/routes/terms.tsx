import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Mail, Section, UL } from "@/components/legal";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — WhereSucceed" },
      {
        name: "description",
        content:
          "The terms for using WhereSucceed: free and Premium use, payments through Stripe, liability and governing law.",
      },
      { property: "og:title", content: "Terms of Service — WhereSucceed" },
      { property: "og:description", content: "The terms for using WhereSucceed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

const link = "text-accent underline-offset-4 hover:underline";

function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms apply when you use WhereSucceed. Please read them. If you do not agree, do not use the service."
    >
      <Section title="1. Who we are">
        <p>
          WhereSucceed is built and run by {COMPANY.name}, org.nr. {COMPANY.orgNumber},{" "}
          {COMPANY.city}, {COMPANY.country} (“we”, “us”). Contact: <Mail />.
        </p>
      </Section>

      <Section title="2. Who can use it">
        <p>
          You must be at least 16 to use the free service. To buy Premium you must be at least 18,
          or have your parent’s or guardian’s consent where the law requires it.
        </p>
      </Section>

      <Section title="3. Free and Premium">
        <UL>
          <li>
            <strong>Free.</strong> The mapping, ranked paths, income and cost figures, country
            comparison and preference tuning are free. No account or card is needed.
          </li>
          <li>
            <strong>Premium.</strong> Premium adds written AI explanations of your results and
            related features. The price shown on the <Link to="/pricing" className={link}>Pricing</Link>{" "}
            page is €6 per month. Premium renews every month until you cancel. We may change the
            price or features with advance notice, and a price change applies from your next
            renewal.
          </li>
        </UL>
      </Section>

      <Section title="4. Payments">
        <p>
          Paid subscriptions are sold by {COMPANY.name} and paid through Stripe, which processes
          the payment for us. Applicable taxes (VAT and sales tax) are added at checkout where
          they apply. Stripe handles your card and billing details under its{" "}
          <a href="https://stripe.com/legal/ssa" className="text-accent underline-offset-4 hover:underline" rel="noreferrer">
            terms
          </a>
          . We receive only limited data from Stripe, such as your email address and subscription
          status, and use it only to manage your access to Premium. You can cancel at any time
          through the link in your receipt email, and Premium then stays active until the end of
          the period you have paid for. Refunds are described in our{" "}
          <Link to="/refund" className={link}>Refund Policy</Link>.
        </p>
      </Section>

      <Section title="5. What the recommendations are, and are not">
        <p>
          WhereSucceed ranks career paths and countries using fixed, published rules and
          simplified, rounded estimates of income, education cost and time to independence. The
          results are algorithmic estimates meant to help you think. They are not career,
          educational, financial, tax or legal advice, and they do not guarantee any outcome.
          Real salaries, costs, admission rules and job markets differ from the figures shown and
          change over time. AI explanations are generated from your results and may contain
          mistakes. Check important facts with official sources and make your own decisions.
        </p>
      </Section>

      <Section title="6. Using the service">
        <p>Please do not:</p>
        <UL>
          <li>attack, overload or try to break into the service,</li>
          <li>
            guess or share Premium access codes, or use automated tools to get around limits, or
          </li>
          <li>copy or resell the service or its data in bulk.</li>
        </UL>
        <p>
          The service, its design, text and software belong to {COMPANY.name} or its licensors.
          You get a personal, non-transferable right to use it. Your own answers remain yours.
        </p>
      </Section>

      <Section title="7. Availability and changes">
        <p>
          We work to keep WhereSucceed running but cannot promise it will always be available or
          error-free. We may change, pause or end features. If we shut down Premium, you get a
          full refund of the time you have paid for but not used, paid back to your original payment method as described
          in our <Link to="/refund" className={link}>Refund Policy</Link>.
        </p>
      </Section>

      <Section title="8. Liability">
        <p>
          We are not liable for decisions you make based on the results, or for lost income or
          opportunities. To the extent the law allows, our total liability to you for anything
          connected with the service is limited to the amount you paid us for Premium in the 12
          months before the event. Nothing in these terms limits liability that cannot be limited
          by law, including liability for intent or gross negligence, and your mandatory consumer
          rights are not affected.
        </p>
      </Section>

      <Section title="9. Privacy">
        <p>
          How we handle personal data is described in our{" "}
          <Link to="/privacy" className={link}>Privacy Policy</Link> and{" "}
          <Link to="/cookies" className={link}>Cookie Policy</Link>.
        </p>
      </Section>

      <Section title="10. Governing law and disputes">
        <p>
          These terms are governed by Norwegian law. Disputes go to the Norwegian courts, with
          Kristiansand as the venue where the law allows. If you are a consumer in the EU/EEA, you
          keep the mandatory consumer protections of the country where you live, and you may bring
          a claim in the courts there.
        </p>
      </Section>

      <Section title="11. Changes to these terms">
        <p>
          We may update these terms. We will change the date at the top and, for changes that
          matter to paying customers, tell you before they apply. If you keep using the service
          after a change takes effect, you accept the new terms.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Questions about these terms: <Mail />.
        </p>
      </Section>
    </LegalPage>
  );
}
