import { beforeEach, describe, expect, it, vi } from "vitest";
import { changedSections, parseStored, sanitiseProfile } from "./store";
import type { Profile } from "./scoring";

const profile: Profile = {
  interests: ["tech", "analytical"],
  skills: { math: 5, communication: 2, creativity: 3, practical: 2, leadership: 2, focus: 5 },
  values: ["income", "freedom", "stability", "prestige", "impact"],
  maxEduYears: 4,
  budget: "medium",
  mobility: "anywhere",
  home: "NO",
  horizon: "balanced",
  situation: "school",
};

describe("reading from storage", () => {
  it("gives an empty state for nothing, garbage or the wrong shape", () => {
    for (const raw of [null, "", "not json", "[]", "42", "null"]) {
      const state = parseStored(raw);
      expect(state.profile).toBeNull();
      expect(state.thread).toEqual([]);
    }
  });

  it("round-trips a valid state", () => {
    const raw = JSON.stringify({
      profile,
      prefs: { income: 70, shortEdu: 20, remote: 10, stayHome: true },
      thread: [
        {
          date: "2026-01-01T00:00:00.000Z",
          note: "First mapping",
          top: [{ id: "2512", score: 90 }],
        },
      ],
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const state = parseStored(raw);
    expect(state.profile).toEqual(profile);
    expect(state.prefs.stayHome).toBe(true);
    expect(state.thread).toHaveLength(1);
    expect(state.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("loads data saved by the first version, which had no updatedAt", () => {
    const state = parseStored(
      JSON.stringify({
        profile,
        prefs: { income: 50, shortEdu: 50, remote: 30, stayHome: false },
        thread: [],
      }),
    );
    expect(state.profile).toEqual(profile);
    expect(state.updatedAt).toBeNull();
  });

  it("drops a malformed profile but keeps the thread", () => {
    const state = parseStored(
      JSON.stringify({
        profile: { ...profile, interests: ["tech", "astrology"] },
        thread: [{ date: "d", note: "n", top: [] }],
      }),
    );
    expect(state.profile).toBeNull();
    expect(state.thread).toHaveLength(1);
  });

  it("rejects incomplete value rankings and unknown enums", () => {
    expect(sanitiseProfile({ ...profile, values: ["income"] })).toBeNull();
    expect(sanitiseProfile({ ...profile, mobility: "teleport" })).toBeNull();
    expect(sanitiseProfile({ ...profile, home: "ZZ" })).toBeNull();
  });

  it("clamps out-of-range numbers and caps the thread length", () => {
    const clean = sanitiseProfile({
      ...profile,
      maxEduYears: 99,
      skills: { ...profile.skills, math: 17 },
    })!;
    expect(clean.maxEduYears).toBe(7);
    expect(clean.skills.math).toBe(5);
    const thread = Array.from({ length: 50 }, (_, i) => ({ date: `d${i}`, note: "n", top: [] }));
    expect(parseStored(JSON.stringify({ thread })).thread).toHaveLength(30);
  });
});

describe("what changed", () => {
  it("names only the sections that differ", () => {
    expect(changedSections(profile, profile)).toEqual([]);
    expect(
      changedSections(profile, { ...profile, skills: { ...profile.skills, math: 2 } }),
    ).toEqual(["skills"]);
    expect(
      changedSections(profile, {
        ...profile,
        interests: ["people"],
        values: [...profile.values].reverse(),
      }),
    ).toEqual(["interests", "priorities"]);
    expect(changedSections(profile, { ...profile, home: "SE" })).toEqual(["situation"]);
  });

  it("treats the same interests in another order as unchanged", () => {
    expect(changedSections(profile, { ...profile, interests: ["analytical", "tech"] })).toEqual([]);
  });
});

describe("saving a mapping", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("stores the profile, adds a thread snapshot and survives a reload", async () => {
    const store = await import("./store");
    store.saveMapping(profile);
    const first = store.getState();
    expect(first.profile).toEqual(profile);
    expect(first.thread).toHaveLength(1);
    expect(first.thread[0]!.note).toBe("First mapping");
    expect(first.thread[0]!.top).toHaveLength(3);
    expect(first.thread[0]!.top[0]!.id).toBe("2512");

    // A fresh module instance reads it back from localStorage.
    vi.resetModules();
    const reloaded = await import("./store");
    expect(reloaded.getState().profile).toEqual(profile);
  });

  it("an edit adds a second snapshot that says what changed", async () => {
    const store = await import("./store");
    store.saveMapping(profile);
    store.saveMapping({
      ...profile,
      interests: ["health", "people"],
      values: ["impact", "stability", "income", "freedom", "prestige"],
    });
    const { thread, profile: saved } = store.getState();
    expect(thread).toHaveLength(2);
    expect(thread[1]!.note).toBe("Mapping updated: interests, priorities");
    expect(saved!.interests).toEqual(["health", "people"]);
    // The top path should follow the new answers.
    expect(thread[1]!.top[0]!.id).not.toBe(thread[0]!.top[0]!.id);
  });

  it("keeps working when storage refuses to write", async () => {
    const store = await import("./store");
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => store.saveMapping(profile)).not.toThrow();
    expect(store.getState().profile).toEqual(profile);
    spy.mockRestore();
  });
});
