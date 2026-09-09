export const CATEGORY_DEFS = [
  { slug: "ai-ml", name: "AI / Machine Learning" },
  { slug: "data", name: "Data / Analytics" },
  { slug: "web", name: "Web / Frontend" },
  { slug: "backend", name: "Backend / APIs" },
  { slug: "mobile", name: "Mobile" },
  { slug: "devops", name: "DevOps / Cloud / Infra" },
  { slug: "systems", name: "Systems / OS / Embedded" },
  { slug: "languages", name: "Language tooling / Compilers" },
  { slug: "developer-tools", name: "Developer Tools / CLIs / Editors" },
  { slug: "security", name: "Security" },
  { slug: "gamedev", name: "Game Development" },
  { slug: "design", name: "Design / UI kits" },
  { slug: "docs", name: "Docs / Education / Content" },
  { slug: "social-good", name: "Civic / Social impact" },
  { slug: "other", name: "Other" },
] as const;

export type CategorySlug = (typeof CATEGORY_DEFS)[number]["slug"];

export const CATEGORY_NAME: Record<CategorySlug, string> = Object.fromEntries(
  CATEGORY_DEFS.map((c) => [c.slug, c.name]),
) as Record<CategorySlug, string>;

export type SignalConfidence = "high" | "low";

export interface Issue {
  number: number;
  title: string;
  url: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  isAssigned: boolean;
  isGoodFirst: boolean;
  isHelpWanted: boolean;
}

export interface ScoreBreakdown {
  starBand: number;
  freshness: number;
  maintainerSignal: number;
  issueQuality: number;
  projectHealth: number;
}

export interface Repo {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  homepage: string | null;
  description: string;
  language: string | null;
  license: string | null;
  topics: string[];
  categories: CategorySlug[];
  primaryCategory: CategorySlug;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  createdAt: string;
  updatedAt: string;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  contributeScore: number;
  scoreBreakdown: ScoreBreakdown;
  why: string[];
  riskFlags: string[];
  signalConfidence: SignalConfidence;
  famousHard: boolean;
  issues: Issue[];
}

export interface LatestData {
  generatedAt: string;
  source: "github-actions" | "sample";
  repoCount: number;
  issueCount: number;
  categories: CategorySlug[];
  repos: Repo[];
}

export interface CategoryCount {
  slug: CategorySlug;
  name: string;
  count: number;
}

export interface CategoriesFile {
  generatedAt: string;
  categories: CategoryCount[];
}

export interface MetaFile {
  generatedAt: string;
  nextUpdateHint: string;
  source: LatestData["source"];
  repoCount: number;
  issueCount: number;
  filters: {
    minStars: number;
    maxStarsDefault: number;
    maxPushAgeDays: number;
    requireLicense: boolean;
    requireDescription: boolean;
    excludeForks: boolean;
    excludeArchived: boolean;
    contributorLabels: string[];
  };
  scoring: {
    weights: {
      starBand: number;
      freshness: number;
      maintainerSignal: number;
      issueQuality: number;
      projectHealth: number;
    };
    maxRepos: number;
    maxReposPerCategory: number;
    maxIssuesPerRepo: number;
  };
}

export const CONTRIBUTOR_LABELS = [
  "good first issue",
  "good-first-issue",
  "first-timers-only",
  "help wanted",
  "help-wanted",
  "beginner friendly",
  "documentation",
  "hacktoberfest",
] as const;

export const SCORE_WEIGHTS = {
  starBand: 0.18,
  freshness: 0.28,
  maintainerSignal: 0.24,
  issueQuality: 0.2,
  projectHealth: 0.1,
} as const;

export const BOARD_LIMITS = {
  minStars: 80,
  maxStarsDefault: 80_000,
  maxPushAgeDays: 45,
  maxRepos: 400,
  maxReposPerCategory: 80,
  maxIssuesPerRepo: 5,
  maxIssuesScored: 8,
} as const;
