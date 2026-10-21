import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Route as cookies } from "@/routes/cookies";
import { Route as privacy } from "@/routes/privacy";
import { Route as refund } from "@/routes/refund";
import { Route as terms } from "@/routes/terms";

/** The legal pages must open for anyone: no saved profile, no login, nothing in storage. */
function mount(path: string) {
  const root = createRootRoute({ component: Outlet });
  const pages = (
    [
      [privacy, "/privacy"],
      [terms, "/terms"],
      [cookies, "/cookies"],
      [refund, "/refund"],
    ] as const
  ).map(([route, id]) =>
    (route as never as { update: (o: object) => never }).update({
      id,
      path: id,
      getParentRoute: () => root,
    }),
  );
  const router = createRouter({
    routeTree: root.addChildren(pages as never) as never,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
}

describe("legal pages", () => {
  afterEach(() => cleanup());

  it.each([
    ["/privacy", "Privacy Policy"],
    ["/terms", "Terms of Service"],
    ["/cookies", "Cookie Policy"],
    ["/refund", "Refund Policy"],
  ])("%s is public and names the company and the support address", async (path, title) => {
    localStorage.clear();
    mount(path);
    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getAllByText(/934 044 029/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kristiansand/).length).toBeGreaterThan(0);
    const mail = screen.getAllByRole("link", { name: "support@wheresucceed.com" })[0];
    expect(mail).toHaveAttribute("href", "mailto:support@wheresucceed.com");
  });

  it("the payment pages say that Creem is the Merchant of Record", async () => {
    for (const path of ["/terms", "/refund", "/privacy"]) {
      mount(path);
      expect((await screen.findAllByText(/Merchant of Record/)).length).toBeGreaterThan(0);
      cleanup();
    }
  });
});
