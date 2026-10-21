import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Mail, Section, Table, UL } from "@/components/legal";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — WhereSucceed" },
      {
        name: "description",
        content:
          "What data WhereSucceed collects, why, how long we keep it, and your rights under the GDPR.",
      },
      { property: "og:title", content: "Privacy Policy — WhereSucceed" },
      { property: "og:description", content: "How WhereSucceed handles your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="WhereSucceed is built to need as little personal data as possible. This page explains what we do handle, why, and what you can ask of us."
    >
      <Section title="1. Who is responsible">
        <p>
          The controller for your personal data is {COMPANY.name}, org.nr. {COMPANY.orgNumber},{" "}
          {COMPANY.city}, {COMPANY.country}. You can reach us at <Mail />.
        </p>
      </Section>

      <Section title="2. What we collect">
        <p>
          There are no user accounts. We do not ask for your name, and you can use the full free
          tool without giving us an email address.
        </p>
        <UL>
          <li>
            <strong>Your mapping.</strong> Your interests, skills, ranked priorities, practical
            constraints (home country, willingness to move, time horizon, education limits), your
            slider settings and the saved thread of earlier results. This is stored in your own
            browser (local storage) and stays on your device. We do not receive it, except as
            described in the next point.
          </li>
          <li>
            <strong>Premium explanations.</strong> If you use “Explain this path”, the answers from
            your mapping and slider settings for that one path are sent to our server and on to our
            AI provider, Anthropic, which writes the explanation. The request contains only
            predefined choices and numbers, no free text. We do not store the request or the
            answer. Your Premium access code is sent with the request so we can check it.
          </li>
          <li>
            <strong>Payment and subscription data.</strong> Paid Premium is paid through
            Stripe (see section 5). Stripe collects your payment details and billing
            information. We receive only limited data from Stripe, such as your email address and
            subscription status, and use it only to manage your access to Premium. We never see
            your card number.
          </li>
          <li>
            <strong>Usage data.</strong> When you visit, a small script reports the page you
            viewed, the page that referred you, the page title, your device type (mobile, tablet
            or desktop), browser language, screen size, and clicks on links that lead to other
            websites. Your country is derived from your connection. Your IP address is not
            stored, and the script sets no cookies and no identifiers, so we cannot follow a
            person from one visit to the next.
          </li>
          <li>
            <strong>Technical data.</strong> Our hosting providers process your IP address and
            browser details to deliver the site and keep it secure. We keep short-lived counters
            in memory to limit abuse of the Premium features.
          </li>
          <li>
            <strong>Messages to us.</strong> If you write to <Mail />, we keep your email address
            and what you tell us so we can answer you.
          </li>
          <li>
            <strong>Fonts.</strong> The site loads fonts from Google Fonts, so your browser
            contacts Google and shares your IP address with it.
          </li>
        </UL>
      </Section>

      <Section title="3. Why we use it, and on what legal basis">
        <Table
          head={["Purpose", "Data", "Legal basis (GDPR)"]}
          rows={[
            [
              "Provide Premium explanations and check your access code",
              "Mapping answers for the request, access code",
              "Art. 6(1)(b): performing our contract with you",
            ],
            [
              "Provide and manage paid Premium access",
              "Email address, subscription status, customer reference",
              "Art. 6(1)(b): contract. Art. 6(1)(c): legal duties such as bookkeeping",
            ],
            [
              "Understand how the site is used and improve it",
              "Anonymous usage data",
              "Art. 6(1)(f): our legitimate interest in improving a free service. You may object.",
            ],
            [
              "Keep the service secure and prevent abuse",
              "Technical data, in-memory counters",
              "Art. 6(1)(f): our legitimate interest in security",
            ],
            [
              "Answer your questions and handle refund requests",
              "Your email and message",
              "Art. 6(1)(b) or 6(1)(f)",
            ],
            [
              "Defend legal claims",
              "Records relevant to a claim",
              "Art. 6(1)(f)",
            ],
          ]}
        />
        <p>
          Your recommendations are produced by fixed scoring rules. They do not produce legal or
          similarly significant effects about you, so no automated decision-making in the sense of
          Art. 22 takes place.
        </p>
      </Section>

      <Section title="4. Who receives data">
        <UL>
          <li>
            <strong>Stripe</strong>, our payment provider for paid Premium. Stripe handles your
            payment data under its own privacy policy.
          </li>
          <li>
            <strong>Anthropic</strong>, our AI provider for Premium explanations, acting as our
            processor.
          </li>
          <li>
            <strong>Hosting and infrastructure providers</strong> that run the site for us, as
            processors.
          </li>
          <li>
            <strong>Google</strong>, which serves the fonts mentioned above.
          </li>
        </UL>
        <p>We do not sell your data and we do not use it for advertising.</p>
      </Section>

      <Section title="5. Payments and Stripe">
        <p>
          Stripe processes payments for paid subscriptions. Stripe handles your payment and
          billing data under its own{" "}
          <a className="text-accent underline-offset-4 hover:underline" href="https://stripe.com/privacy" rel="noreferrer">
            privacy policy
          </a>
          . We only receive limited data from Stripe, such as your email address and subscription
          status, to manage your access. See also our{" "}
          <Link to="/terms" className="text-accent underline-offset-4 hover:underline">Terms</Link>{" "}
          and <Link to="/refund" className="text-accent underline-offset-4 hover:underline">Refund Policy</Link>.
        </p>
      </Section>

      <Section title="6. Transfers outside the EU/EEA">
        <p>
          Some of the providers above, such as Anthropic and Google, may process data in the
          United States or other countries outside the EU/EEA. Where that happens we rely on an
          adequacy decision (for example the EU–US Data Privacy Framework) or on the European
          Commission’s standard contractual clauses. You can ask us for details at <Mail />.
        </p>
      </Section>

      <Section title="7. How long we keep it">
        <Table
          head={["Data", "Kept for"]}
          rows={[
            [
              "Your mapping and settings",
              "Only in your browser (local storage) on your device, until you clear it. We hold no copy.",
            ],
            ["Premium explanation requests", "Not stored by us."],
            ["Anonymous usage statistics", "Up to 14 months, then deleted or reduced to totals."],
            ["Support emails", "12 months."],
            [
              "Accounting records",
              "5 years, as the Norwegian bookkeeping rules require. Subscription status is kept only while your Premium is active.",
            ],
          ]}
        />
      </Section>

      <Section title="8. Your rights">
        <p>Under the GDPR you have the right to:</p>
        <UL>
          <li>access the personal data we hold about you and get a copy,</li>
          <li>have inaccurate data corrected,</li>
          <li>have your data erased,</li>
          <li>restrict how we use it,</li>
          <li>receive the data you gave us in a portable format,</li>
          <li>object to processing based on our legitimate interests, and</li>
          <li>withdraw any consent you have given, at any time.</li>
        </UL>
        <p>
          To use these rights, write to <Mail />. We answer within one month. We may need to
          confirm who you are first. Because your mapping lives on your own device, you can also
          delete it yourself at any time by clearing the site data for wheresucceed.com in your
          browser.
        </p>
        <p>
          If you are unhappy with how we handle your data, you can complain to the Norwegian Data
          Protection Authority (Datatilsynet, datatilsynet.no) or to the supervisory authority in
          your own country.
        </p>
      </Section>

      <Section title="9. Age">
        <p>
          You must be at least 16 to use the free service, and at least 18 to buy Premium (or have
          your parent’s or guardian’s consent where the law requires it). We do not knowingly
          collect personal data from anyone younger than 16. If you think a younger person has sent us data, write to us
          and we will delete it.
        </p>
      </Section>

      <Section title="10. Changes">
        <p>
          If we change how we handle data in a way that matters to you, we update this page and
          the date at the top. For larger changes we will make that clear on the site.
        </p>
      </Section>
    </LegalPage>
  );
}
