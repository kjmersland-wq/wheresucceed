import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, Mail, Section, Table } from "@/components/legal";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — WhereSucceed" },
      {
        name: "description",
        content:
          "WhereSucceed sets no cookies. This page explains what is stored in your browser and why.",
      },
      { property: "og:title", content: "Cookie Policy — WhereSucceed" },
      { property: "og:description", content: "What WhereSucceed stores in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="WhereSucceed does not set any cookies. It does store a little information in your browser so the tool can remember your answers. This page lists exactly what."
    >
      <Section title="1. Cookies">
        <p>
          We do not use essential, analytics, advertising or any other cookies on WhereSucceed. For
          that reason there is no cookie banner: there is nothing to accept or decline. If we ever
          add cookies that are not strictly necessary, we will ask for your consent first and
          update this page.
        </p>
      </Section>

      <Section title="2. What is stored in your browser">
        <p>
          The following items are kept in your browser’s local storage. They stay on your device,
          are not sent to us automatically, and are needed for the service you asked for.
        </p>
        <Table
          head={["Name", "What it holds", "Why"]}
          rows={[
            [
              <code key="a">wheresucceed:v1</code>,
              "Your mapping, slider settings and saved thread",
              "So your ranked paths are still there when you come back",
            ],
            [
              <code key="b">wheresucceed:premium</code>,
              "Whether Premium is on and your access code",
              "So Premium features keep working on this device",
            ],
          ]}
        />
      </Section>

      <Section title="3. Usage statistics">
        <p>
          We measure visits with a small script that sends page views and outbound link clicks to
          our own system. It uses no cookies and does not store anything in your browser, and it
          does not keep your IP address. See the{" "}
          <Link to="/privacy" className="text-accent underline-offset-4 hover:underline">Privacy Policy</Link>{" "}
          for what is reported.
        </p>
      </Section>

      <Section title="4. Other companies">
        <p>
          The site loads fonts from Google Fonts, which means your browser contacts Google. When
          you buy Premium you are sent to Creem’s checkout, which is run by Creem and may use its
          own cookies. Their policies apply on their pages.
        </p>
      </Section>

      <Section title="5. Clearing what is stored">
        <p>
          You can remove the items above at any time by clearing the site data for
          wheresucceed.com in your browser settings. This deletes your saved mapping, so export
          or note down anything you want to keep first.
        </p>
        <p>
          Questions: <Mail />.
        </p>
      </Section>
    </LegalPage>
  );
}
