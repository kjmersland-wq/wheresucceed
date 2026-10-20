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
            <strong>Payment and subscription data.</strong> Paid Premium is sold by Creem as
            Merchant of Record (see section 5). Creem collects your payment details and billing
            information. We receive only what we need to give you access, such as your email
            address, subscription status and a customer reference. We never see your card number.
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
            <strong>Creem</strong>, the Merchant of Record for paid Premium. Creem handles your
            payment data as an independent controller under its own privacy policy.
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

      <Section title="5. Payments and Creem">
        <p>
          Creem is the Merchant of Record for paid subscriptions. That means Creem is the seller
          of record, takes the payment, handles VAT and sales tax, and processes refunds. Its
          handling of your payment and billing data is described in Creem’s own privacy policy at{" "}
          <a className="text-accent underline-offset-4 hover:underline" href="https://www.creem.io" rel="noreferrer">
            creem.io
          </a>
          . See also our <Link to="/terms" className="text-accent underline-offset-4 hover:underline">Terms</Link>{" "}
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
              "On your device until you clear your browser’s site data. We hold no copy.",
            ],
            ["Premium explanation requests", "Not stored by us."],
            ["Anonymous usage data", "Up to 14 months, then deleted or reduced to totals."],
            ["Messages to support", "Up to 12 months after the matter is resolved."],
            [
              "Subscription and sales records",
              "While your subscription is active, and the accounting records the law requires, which is five years under the Norwegian Bookkeeping Act.",
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
          WhereSucceed is meant for people aged 16 and over. We do not knowingly collect personal
          data from anyone younger. If you think a younger person has sent us data, write to us
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
