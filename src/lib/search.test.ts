import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Repo } from "../../scripts/types.ts";
import { searchRepos } from "./search.ts";

function repo(over: Partial<Repo> = {}): Repo {
  return {
    id: 1,
    owner: "acme",
    name: "demo",
    fullName: "acme/demo",
    url: "https://github.com/acme/demo",
    homepage: null,
    description: "A CLI for widgets",
    language: "Rust",
    license: "MIT",
    topics: ["cli"],
    categories: ["developer-tools"],
    primaryCategory: "developer-tools",
    stars: 400,
    forks: 10,
    openIssues: 3,
    pushedAt: "2026-09-08T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2026-09-08T00:00:00Z",
    hasContributing: true,
    hasCodeOfConduct: false,
    contributeScore: 80,
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
    issues: [
      {
        number: 12,
        title: "Docs: add a getting started example",
        url: "https://github.com/acme/demo/issues/12",
        labels: ["good first issue", "documentation"],
        createdAt: "2026-09-01T00:00:00Z",
        updatedAt: "2026-09-08T00:00:00Z",
        comments: 1,
        isAssigned: false,
        isGoodFirst: true,
        isHelpWanted: false,
      },
    ],
    ...over,
  };
}

describe("searchRepos", () => {
  it("matches the good first issue chip against labels", () => {
    const rows = searchRepos([repo()], "good first issue");
    assert.equal(rows.length, 1);
  });

  it("matches issue titles and still requires every term", () => {
    assert.equal(searchRepos([repo()], "getting started").length, 1);
    assert.equal(searchRepos([repo()], "android").length, 0);
  });
});
