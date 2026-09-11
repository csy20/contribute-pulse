import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  boardTooThin,
  capBoard,
  contributeScore,
  freshness,
  isBoardEligible,
  isContributorLabel,
  passesHardFilters,
  scoreRepo,
  starBand,
} from "./scoring.ts";
import type { Issue, Repo } from "./types.ts";

const now = new Date("2026-09-10T12:00:00Z");

function issue(over: Partial<Issue> = {}): Issue {
  return {
    number: 1,
    title: "Docs: fix typo in README",
    url: "https://github.com/acme/demo/issues/1",
    labels: ["good first issue"],
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-08T00:00:00Z",
    comments: 1,
    isAssigned: false,
    isGoodFirst: true,
    isHelpWanted: false,
    ...over,
  };
}

describe("starBand", () => {
  it("peaks in the 2k–15k range", () => {
    assert.equal(starBand(5000), 100);
    assert.ok(starBand(150) > 55 && starBand(150) < 80);
    assert.ok(starBand(50_000) <= 40);
    assert.ok(starBand(120_000) < starBand(50_000));
  });
});

describe("freshness", () => {
  it("uses the specified day buckets", () => {
    assert.equal(freshness("2026-09-08T00:00:00Z", now), 100);
    assert.equal(freshness("2026-08-30T00:00:00Z", now), 80);
    assert.equal(freshness("2026-08-20T00:00:00Z", now), 55);
    assert.equal(freshness("2026-08-01T00:00:00Z", now), 25);
    assert.equal(freshness("2026-07-01T00:00:00Z", now), 0);
  });
});

describe("hard filters", () => {
  const base = {
    isPrivate: false,
    isArchived: false,
    isDisabled: false,
    isFork: false,
    hasLicense: true,
    pushedAt: "2026-09-01T00:00:00Z",
    stars: 400,
    description: "A library",
    hasDefaultBranch: true,
    contributorIssueCount: 2,
    allowFamousHard: false,
  };

  it("rejects stale, forked, unlicensed, and issue-less repos", () => {
    assert.equal(passesHardFilters(base, now), true);
    assert.equal(passesHardFilters({ ...base, isFork: true }, now), false);
    assert.equal(passesHardFilters({ ...base, hasLicense: false }, now), false);
    assert.equal(passesHardFilters({ ...base, description: "  " }, now), false);
    assert.equal(passesHardFilters({ ...base, contributorIssueCount: 0 }, now), false);
    assert.equal(passesHardFilters({ ...base, pushedAt: "2026-07-01T00:00:00Z" }, now), false);
    assert.equal(passesHardFilters({ ...base, stars: 20 }, now), false);
    assert.equal(passesHardFilters({ ...base, stars: 120_000 }, now), false);
    assert.equal(passesHardFilters({ ...base, stars: 120_000, allowFamousHard: true }, now), true);
  });
});

describe("scoreRepo", () => {
  it("weights mid-size active repos above mega-repos", () => {
    const common = {
      pushedAt: "2026-09-08T00:00:00Z",
      mergedLast30d: 8,
      openPrs: 4,
      hasContributing: true,
      hasCodeOfConduct: true,
      issues: [issue(), issue({ number: 2 })],
      hasLicense: true,
      topics: ["cli", "rust"],
      hasReadme: true,
      description: "A focused command-line tool for developers.",
      forks: 40,
      watchers: 20,
    };
    const mid = scoreRepo({ ...common, stars: 1200 }, now);
    const huge = scoreRepo({ ...common, stars: 90_000 }, now);
    assert.ok(mid.contributeScore > huge.contributeScore);
    assert.ok(mid.contributeScore > 60);
    assert.ok(mid.why.length >= 2);
    assert.ok(huge.riskFlags.some((r) => /famous/i.test(r)));
  });

  it("marks maintainer signal as low when merged PR data is missing", () => {
    const result = scoreRepo(
      {
        stars: 400,
        pushedAt: "2026-09-08T00:00:00Z",
        mergedLast30d: null,
        openPrs: null,
        hasContributing: false,
        hasCodeOfConduct: false,
        issues: [issue()],
        hasLicense: true,
        topics: [],
        hasReadme: true,
        description: "Notes",
        forks: 2,
        watchers: 1,
      },
      now,
    );
    assert.equal(result.signalConfidence, "low");
    assert.ok(result.riskFlags.includes("No CONTRIBUTING.md"));
    assert.ok(result.riskFlags.includes("Few topics"));
  });
});

describe("labels", () => {
  it("recognizes contributor-oriented labels", () => {
    assert.equal(isContributorLabel("good-first-issue"), true);
    assert.equal(isContributorLabel("Help Wanted"), true);
    assert.equal(isContributorLabel("hacktoberfest"), true);
    assert.equal(isContributorLabel("bug"), false);
  });
});

describe("capBoard", () => {
  it("caps total repos and per-category membership", () => {
    const repos = Array.from({ length: 30 }, (_, i) => {
      const score = 90 - i;
      return {
        id: i,
        owner: "org",
        name: `r${i}`,
        fullName: `org/r${i}`,
        url: `https://github.com/org/r${i}`,
        homepage: null,
        description: "x",
        language: "Go",
        license: "MIT",
        topics: [],
        categories: ["web"] as const,
        primaryCategory: "web",
        stars: 100,
        forks: 1,
        openIssues: 1,
        pushedAt: "2026-09-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2026-09-01T00:00:00Z",
        hasContributing: true,
        hasCodeOfConduct: false,
        contributeScore: score,
        scoreBreakdown: {
          starBand: 80,
          freshness: 80,
          maintainerSignal: 80,
          issueQuality: 80,
          projectHealth: 80,
        },
        why: ["ok"],
        riskFlags: [],
        signalConfidence: "high",
        famousHard: false,
        issues: [issue({ number: i + 1 })],
      } satisfies Repo;
    });
    const capped = capBoard(repos);
    assert.ok(capped.length <= 80);
    assert.equal(capped[0].name, "r0");
  });
});

describe("isBoardEligible", () => {
  it("accepts a licensed recent repo with starter issues", () => {
    assert.equal(
      isBoardEligible(
        {
          fullName: "org/demo",
          url: "https://github.com/org/demo",
          description: "A library",
          pushedAt: "2026-09-08T00:00:00Z",
          issues: [issue()],
        },
        now,
      ),
      true,
    );
  });

  it("rejects a repo with no issues or a stale push", () => {
    assert.equal(
      isBoardEligible(
        {
          fullName: "org/demo",
          url: "https://github.com/org/demo",
          description: "A library",
          pushedAt: "2026-09-08T00:00:00Z",
          issues: [],
        },
        now,
      ),
      false,
    );
    assert.equal(
      isBoardEligible(
        {
          fullName: "org/demo",
          url: "https://github.com/org/demo",
          description: "A library",
          pushedAt: "2026-01-01T00:00:00Z",
          issues: [issue()],
        },
        now,
      ),
      false,
    );
  });
});

describe("boardTooThin", () => {
  it("rejects an empty or collapsed default board", () => {
    assert.ok(boardTooThin(0, 400));
    assert.ok(boardTooThin(20, 400));
    assert.ok(boardTooThin(100, 400));
    assert.equal(boardTooThin(250, 400), null);
    assert.equal(boardTooThin(90, null), null);
  });
});

describe("contributeScore range", () => {
  it("stays within 0–100", () => {
    const n = contributeScore({
      starBand: 100,
      freshness: 100,
      maintainerSignal: 100,
      issueQuality: 100,
      projectHealth: 100,
    });
    assert.equal(n, 100);
  });
});
