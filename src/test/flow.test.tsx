import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyseProfile, rankCareers, type PreferenceWeights } from "@/engine";
import { toPreferenceWeights, toUserProfile } from "@/lib/profile-adapter";
import { parseStored, setState } from "@/lib/store";
import { Route as myPaths } from "@/routes/my-paths";
import { Route as onboarding } from "@/routes/onboarding";
import { Route as pathDetail } from "@/routes/paths.$id";
import { Route as profilePage } from "@/routes/profile";

const KEY = "wheresucceed:v1";

/**
 * The real pages under a plain root. The app's own root renders a whole HTML document
 * (html, head, scripts), which cannot be mounted inside jsdom.
 */
function buildTree() {
  const root = createRootRoute({ component: Outlet });
  const page = (route: typeof myPaths, id: string, path: string) =>
    route.update({ id, path, getParentRoute: () => root } as never);
  return root.addChildren([
    page(onboarding as never, "/onboarding", "/onboarding"),
    page(myPaths, "/my-paths", "/my-paths"),
    page(profilePage as never, "/profile", "/profile"),
    page(pathDetail as never, "/paths/$id", "/paths/$id"),
  ] as never);
}

function mount(path: string) {
  const router = createRouter({
    routeTree: buildTree() as never,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  render(<RouterProvider router={router} />);
  return router;
}

const stored = () => parseStored(localStorage.getItem(KEY));
const titles = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
const eur = (n: number) => (n >= 1000 ? `€${Math.round(n / 1000)}k` : `€${n}`);

/** Walks the real onboarding screens: interests, skills, values, situation, summary. */
async function completeOnboarding() {
  fireEvent.click(await screen.findByText("Technology & code"));
  fireEvent.click(screen.getByText("Solving hard problems"));
  fireEvent.click(screen.getByText("Continue"));
  for (const skill of [
    "Numbers & logic",
    "Talking & writing",
    "Ideas & originality",
    "Practical work",
    "Leading others",
    "Deep focus",
  ]) {
    const level = skill === "Numbers & logic" || skill === "Deep focus" ? 5 : 2;
    fireEvent.click(await screen.findByLabelText(`${skill} ${level}`));
  }
  fireEvent.click(screen.getByText("Continue"));
  // Values: move the top priority down one place so the saved order is not the default.
  const down = await screen.findAllByLabelText("Move down");
  fireEvent.click(down[0]!);
  fireEvent.click(screen.getByText("Continue"));
  fireEvent.click(await screen.findByText("In school"));
  fireEvent.click(screen.getByText("Anywhere"));
  fireEvent.click(screen.getByText("Balanced"));
  fireEvent.click(screen.getByText("Continue"));
  fireEvent.click(await screen.findByText("See my paths →"));
}

describe("onboarding → saved profile → live results → re-ranking", () => {
  beforeEach(() => {
    localStorage.clear();
    // The store keeps a cache between tests; reset it to an empty, unsaved state.
    setState(() => parseStored(null));
    localStorage.clear();
  });
  afterEach(() => cleanup());

  it("saves a structured profile and lands on /my-paths with engine results", async () => {
    const router = mount("/onboarding");
    await completeOnboarding();

    await waitFor(() => expect(router.state.location.pathname).toBe("/my-paths"));

    const saved = stored();
    expect(saved.profile).toMatchObject({
      interests: ["tech", "analytical"],
      skills: { math: 5, communication: 2, creativity: 2, practical: 2, leadership: 2, focus: 5 },
      mobility: "anywhere",
      horizon: "balanced",
      situation: "school",
      home: "NO",
    });
    expect(saved.profile?.values).toHaveLength(5);
    expect(saved.thread).toHaveLength(1);

    // The page shows what the engine computes, not a fixed list.
    const expected = rankCareers(
      analyseProfile(toUserProfile(saved.profile!)),
      toPreferenceWeights(saved.prefs),
    );
    await screen.findByText("Your paths, ranked.");
    expect(titles().slice(0, 6)).toEqual(expected.slice(0, 6).map((m) => m.title));
    expect(screen.getByText("Paths ranked").parentElement?.textContent).toContain(
      String(expected.length),
    );
  });

  it("re-ranks when a slider moves and when Stay is switched on, and persists both", async () => {
    mount("/onboarding");
    await completeOnboarding();
    await screen.findByText("Your paths, ranked.");
    const analysis = analyseProfile(toUserProfile(stored().profile!));
    // Written out by hand, so a mistake in the page's own slider conversion cannot hide itself.
    const rank = (prefs: PreferenceWeights) =>
      rankCareers(analysis, prefs)
        .slice(0, 6)
        .map((m) => m.title);
    const norway = () => screen.getAllByText(/^🇳🇴 Norway$/).length;

    const before = rank({ incomeFocus: 0.5, shortEducation: 0.5, remoteFriendly: 0.3, stayLocal: 0 });
    await waitFor(() => expect(titles()).toEqual(before));

    fireEvent.change(screen.getByLabelText("Remote-friendly"), { target: { value: "100" } });
    const remote = rank({ incomeFocus: 0.5, shortEducation: 0.5, remoteFriendly: 1, stayLocal: 0 });
    await waitFor(() => expect(titles()).toEqual(remote));
    expect(remote).not.toEqual(before);

    fireEvent.change(screen.getByLabelText("Income focus"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Shorter education"), { target: { value: "0" } });
    const tunedPrefs = { incomeFocus: 1, shortEducation: 0, remoteFriendly: 1, stayLocal: 0 };
    await waitFor(() => expect(titles()).toEqual(rank(tunedPrefs)));
    // With no reason to stay, at least one career is better abroad.
    expect(norway()).toBeLessThan(6);

    fireEvent.click(screen.getByRole("switch"));
    await waitFor(() => expect(titles()).toEqual(rank({ ...tunedPrefs, stayLocal: 1 })));
    expect(norway()).toBe(6);

    expect(stored().prefs).toEqual({ income: 100, shortEdu: 0, remote: 100, stayHome: true });
  });

  it("changes the income numbers when a country is picked", async () => {
    mount("/onboarding");
    await completeOnboarding();
    await screen.findByText("Your paths, ranked.");
    const analysis = analyseProfile(toUserProfile(stored().profile!));
    const top = rankCareers(analysis, toPreferenceWeights(stored().prefs))[0]!;
    const occupation = analysis.careers.find((c) => c.occupation.isco === top.isco)!;
    const cardOf = () => screen.getAllByRole("heading", { level: 3 })[0]!.closest("div.relative")!;

    // Denmark is in the engine's data, so it must be a choice here too.
    for (const code of ["DE", "US", "DK"] as const) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(code) }));
      const option = occupation.options.find((o) => o.country === code)!;
      await waitFor(() => {
        const text = cardOf().textContent ?? "";
        expect(text).toContain(eur(option.incomeYear1));
        expect(text).toContain(eur(option.incomeYear10));
      });
    }
  });

  it("shows the saved mapping on /profile and Edit mapping opens it filled in", async () => {
    const router = mount("/onboarding");
    await completeOnboarding();
    await screen.findByText("Your paths, ranked.");

    await router.navigate({ to: "/profile" });
    await screen.findByText("This is you, today.");
    expect(screen.getByText("Technology & code")).toBeInTheDocument();
    expect(screen.getByText("Solving hard problems")).toBeInTheDocument();
    expect(screen.getByText("Anywhere")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Edit mapping"));
    await waitFor(() => expect(router.state.location.pathname).toBe("/onboarding"));
    expect(await screen.findByText(/You're editing your saved mapping/)).toBeInTheDocument();
    // The interests step comes back with the saved answers, so Continue is already enabled.
    expect(screen.getByText("Continue").closest("button")).not.toBeDisabled();
  });

  it("links each card to a detail page that exists and shows the same score", async () => {
    const router = mount("/onboarding");
    await completeOnboarding();
    await screen.findByText("Your paths, ranked.");

    const heading = screen.getAllByRole("heading", { level: 3 })[0]!;
    const title = heading.textContent;
    const analysis = analyseProfile(toUserProfile(stored().profile!));
    const top = rankCareers(analysis, toPreferenceWeights(stored().prefs))[0]!;
    fireEvent.click(within(heading).getByRole("link"));

    await waitFor(() => expect(router.state.location.pathname).toBe(`/paths/${top.isco}`));
    await screen.findByText(`Why it scores ${top.matchScore}`);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(title);
  });

  it("does not render a detail page for an id that is not an ISCO code in the data", async () => {
    mount("/paths/software-engineer");
    expect(await screen.findByText("Not Found")).toBeInTheDocument();
  });

  it("shows the start prompt instead of results when there is no saved profile", async () => {
    mount("/my-paths");
    expect(await screen.findByText("Let's map you first")).toBeInTheDocument();
  });
});
