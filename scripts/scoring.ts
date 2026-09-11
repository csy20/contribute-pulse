import {
  BOARD_LIMITS,
  CONTRIBUTOR_LABELS,
  SCORE_WEIGHTS,
  type Issue,
  type Repo,
  type ScoreBreakdown,
  type SignalConfidence,
} from "./types.ts";

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

export function daysBetween(iso: string, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000;
}

function logInterp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  const lx = Math.log(Math.max(x, 1));
  const l0 = Math.log(Math.max(x0, 1));
  const l1 = Math.log(Math.max(x1, 1));
  if (l1 === l0) return y0;
  const t = (lx - l0) / (l1 - l0);
  return y0 + t * (y1 - y0);
}

/**
 * Mid-popular repos score highest. Log-interpolated inside each star band.
 */
export function starBand(stars: number): number {
  if (stars < 80) return 35;
  if (stars < 300) return logInterp(stars, 80, 300, 55, 80);
  if (stars < 2_000) return logInterp(stars, 300, 2_000, 80, 100);
  if (stars < 15_000) return 100;
  if (stars < 40_000) return logInterp(stars, 15_000, 40_000, 70, 70);
  if (stars <= 80_000) return logInterp(stars, 40_000, 80_000, 40, 40);
  return 25;
}

export function freshness(pushedAt: string, now: Date): number {
  const days = daysBetween(pushedAt, now);
  if (days <= 7) return 100;
  if (days <= 14) return 80;
  if (days <= 30) return 55;
  if (days <= 45) return 25;
  return 0;
}

export interface MaintainerInput {
  mergedLast30d: number | null;
  openPrs: number | null;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  pushedAt: string;
  recentIssueUpdates: number;
}

export function maintainerSignal(
  input: MaintainerInput,
  now: Date,
): { score: number; signalConfidence: SignalConfidence } {
  let raw = 0;
  let signalConfidence: SignalConfidence = "high";

  if (input.mergedLast30d == null) {
    signalConfidence = "low";
    const days = daysBetween(input.pushedAt, now);
    if (days <= 7) raw += 50;
    else if (days <= 14) raw += 40;
    else if (days <= 30) raw += 25;
    else raw += 10;
    raw += Math.min(input.recentIssueUpdates, 8) * 4;
  } else {
    raw += (Math.min(input.mergedLast30d, 20) / 20) * 45;
  }

  if (input.hasContributing) raw += 40;
  if (input.hasCodeOfConduct) raw += 15;

  if (input.openPrs != null && input.mergedLast30d != null) {
    const merged = Math.max(input.mergedLast30d, 0);
    if (input.openPrs > 5 * Math.max(merged, 1)) raw *= 0.65;
  }

  return { score: clamp(raw), signalConfidence };
}

export function isContributorLabel(label: string): boolean {
  const compact = label.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const aliases = new Set(
    CONTRIBUTOR_LABELS.map((l) => l.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()),
  );
  aliases.add("good first issues");
  aliases.add("help wanted");
  aliases.add("beginner friendly");
  aliases.add("first timers only");
  aliases.add("hacktoberfest");
  aliases.add("documentation");
  aliases.add("docs");
  return aliases.has(compact);
}

export function isGoodFirstLabel(label: string): boolean {
  const compact = label.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return (
    compact === "good first issue" ||
    compact === "good first issues" ||
    compact === "first timers only" ||
    compact === "beginner friendly"
  );
}

export function isHelpWantedLabel(label: string): boolean {
  const compact = label.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return compact === "help wanted" || compact === "help wanted :heart:";
}

export function issueQuality(issues: Issue[], now: Date): number {
  const useful = issues.slice(0, BOARD_LIMITS.maxIssuesScored);
  if (useful.length === 0) return 0;

  const scores = useful.map((issue) => {
    let s = 35;
    const updateDays = daysBetween(issue.updatedAt, now);
    const ageDays = daysBetween(issue.createdAt, now);
    if (updateDays <= 7) s += 35;
    else if (updateDays <= 30) s += 25;
    else if (updateDays <= 60) s += 10;
    if (!issue.isAssigned) s += 20;
    if (ageDays > 120) s -= 25;
    if (issue.comments > 8) s -= 15;
    if (issue.isGoodFirst) s += 10;
    return clamp(s);
  });

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export interface HealthInput {
  hasLicense: boolean;
  topicCount: number;
  hasReadme: boolean;
  descriptionLength: number;
  forks: number;
  watchers: number;
}

export function projectHealth(input: HealthInput): number {
  let s = 0;
  if (input.hasLicense) s += 30;
  if (input.topicCount > 0) s += 20;
  if (input.hasReadme) s += 20;
  if (input.descriptionLength > 40) s += 10;
  s += Math.min(input.forks / 150, 1) * 10;
  s += Math.min(input.watchers / 80, 1) * 10;
  return clamp(s);
}

export function contributeScore(breakdown: ScoreBreakdown): number {
  const raw =
    SCORE_WEIGHTS.starBand * breakdown.starBand +
    SCORE_WEIGHTS.freshness * breakdown.freshness +
    SCORE_WEIGHTS.maintainerSignal * breakdown.maintainerSignal +
    SCORE_WEIGHTS.issueQuality * breakdown.issueQuality +
    SCORE_WEIGHTS.projectHealth * breakdown.projectHealth;
  return Math.round(clamp(raw) * 10) / 10;
}

export interface ScoreInput {
  stars: number;
  pushedAt: string;
  mergedLast30d: number | null;
  openPrs: number | null;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  issues: Issue[];
  hasLicense: boolean;
  topics: string[];
  hasReadme: boolean;
  description: string;
  forks: number;
  watchers: number;
}

export interface ScoreResult {
  contributeScore: number;
  scoreBreakdown: ScoreBreakdown;
  why: string[];
  riskFlags: string[];
  signalConfidence: SignalConfidence;
}

export function scoreRepo(input: ScoreInput, now = new Date()): ScoreResult {
  const recentIssueUpdates = input.issues.filter((i) => daysBetween(i.updatedAt, now) <= 30).length;
  const maint = maintainerSignal(
    {
      mergedLast30d: input.mergedLast30d,
      openPrs: input.openPrs,
      hasContributing: input.hasContributing,
      hasCodeOfConduct: input.hasCodeOfConduct,
      pushedAt: input.pushedAt,
      recentIssueUpdates,
    },
    now,
  );

  const breakdown: ScoreBreakdown = {
    starBand: Math.round(starBand(input.stars) * 10) / 10,
    freshness: freshness(input.pushedAt, now),
    maintainerSignal: Math.round(maint.score * 10) / 10,
    issueQuality: Math.round(issueQuality(input.issues, now) * 10) / 10,
    projectHealth: Math.round(
      projectHealth({
        hasLicense: input.hasLicense,
        topicCount: input.topics.length,
        hasReadme: input.hasReadme,
        descriptionLength: input.description.trim().length,
        forks: input.forks,
        watchers: input.watchers,
      }) * 10,
    ) / 10,
  };

  return {
    contributeScore: contributeScore(breakdown),
    scoreBreakdown: breakdown,
    why: buildWhy(input, breakdown, now),
    riskFlags: buildRisks(input, maint.signalConfidence),
    signalConfidence: maint.signalConfidence,
  };
}

function buildWhy(input: ScoreInput, breakdown: ScoreBreakdown, now: Date): string[] {
  const why: string[] = [];
  if (input.mergedLast30d != null && input.mergedLast30d >= 3) {
    why.push(`Merged ${input.mergedLast30d} PRs in the last 30 days`);
  } else if (breakdown.freshness >= 80) {
    why.push("Pushed in the last two weeks");
  } else if (breakdown.freshness >= 55) {
    why.push("Pushed this month");
  }

  const unassignedRecent = input.issues.filter(
    (i) => !i.isAssigned && daysBetween(i.updatedAt, now) <= 7,
  );
  const goodFirst = input.issues.filter((i) => i.isGoodFirst);
  if (unassignedRecent.length && goodFirst.length) {
    why.push(
      `${unassignedRecent.length} unassigned starter ${unassignedRecent.length === 1 ? "issue" : "issues"} updated this week`,
    );
  } else if (input.issues.length) {
    why.push(
      `${input.issues.length} open starter ${input.issues.length === 1 ? "issue" : "issues"}`,
    );
  }

  if (input.hasContributing) why.push("Has CONTRIBUTING.md");
  if (breakdown.starBand >= 80 && input.stars <= 15_000) {
    why.push("Mid-size: popular enough to matter, small enough to review");
  }
  if (input.hasCodeOfConduct && why.length < 4) why.push("Has a code of conduct");

  return why.slice(0, 4);
}

function buildRisks(input: ScoreInput, signalConfidence: SignalConfidence): string[] {
  const risks: string[] = [];
  if (input.stars > 80_000) {
    risks.push("Famous but hard — PRs compete with a very large crowd");
  } else if (input.stars > 15_000) {
    risks.push("High star count, reviews may be slow");
  }
  if (input.topics.length === 0) risks.push("Few topics");
  if (!input.hasContributing) risks.push("No CONTRIBUTING.md");
  if (signalConfidence === "low") {
    risks.push("Maintainer activity estimated from push recency");
  }
  if (
    input.openPrs != null &&
    input.mergedLast30d != null &&
    input.openPrs > 5 * Math.max(input.mergedLast30d, 1)
  ) {
    risks.push("Open PRs may be backing up");
  }
  const crowded = input.issues.filter((i) => i.comments > 8).length;
  if (crowded >= 3) risks.push("Starter issues are already crowded with comments");
  return risks;
}

export interface HardFilterInput {
  isPrivate: boolean;
  isArchived: boolean;
  isDisabled: boolean;
  isFork: boolean;
  hasLicense: boolean;
  pushedAt: string | null;
  stars: number;
  description: string | null;
  hasDefaultBranch: boolean;
  contributorIssueCount: number;
  allowFamousHard: boolean;
}

export function passesHardFilters(input: HardFilterInput, now = new Date()): boolean {
  if (input.isPrivate || input.isArchived || input.isDisabled) return false;
  if (input.isFork) return false;
  if (!input.hasLicense) return false;
  if (!input.pushedAt) return false;
  if (daysBetween(input.pushedAt, now) > BOARD_LIMITS.maxPushAgeDays) return false;
  if (!input.description || !input.description.trim()) return false;
  if (!input.hasDefaultBranch) return false;
  if (input.contributorIssueCount < 1) return false;
  if (input.stars < BOARD_LIMITS.minStars) return false;
  if (input.stars > BOARD_LIMITS.maxStarsDefault && !input.allowFamousHard) return false;
  return true;
}

/** Final board snapshot checks. Drop a row instead of failing the whole crawl. */
export function isBoardEligible(
  repo: {
    fullName?: string;
    url?: string;
    description?: string | null;
    pushedAt?: string | null;
    issues?: unknown[] | null;
  },
  now = new Date(),
): boolean {
  if (!repo.fullName || !repo.url) return false;
  if (!repo.description?.trim()) return false;
  if (!repo.pushedAt) return false;
  if (daysBetween(repo.pushedAt, now) > BOARD_LIMITS.maxPushAgeDays) return false;
  if (!repo.issues?.length) return false;
  return true;
}

export const MIN_DEFAULT_BOARD = 80;

export function defaultBoardCount(repos: { famousHard: boolean; stars: number }[]): number {
  return repos.filter((r) => !r.famousHard && r.stars <= 80_000).length;
}

/** Refuse to publish a collapsed snapshot over a healthy previous board. */
export function boardTooThin(
  nextDefaultCount: number,
  prevDefaultCount: number | null,
  minDefault = MIN_DEFAULT_BOARD,
): string | null {
  if (nextDefaultCount === 0) return "default board would be empty";
  if (nextDefaultCount < minDefault) return `default board too small (${nextDefaultCount} < ${minDefault})`;
  if (prevDefaultCount != null && prevDefaultCount >= minDefault && nextDefaultCount < prevDefaultCount * 0.5) {
    return `default board collapsed ${prevDefaultCount} -> ${nextDefaultCount}`;
  }
  return null;
}

/** Keep at most 400 repos, 80 per category. Higher scores win. */
export function capBoard(repos: Repo[]): Repo[] {
  const sorted = [...repos].sort(
    (a, b) => b.contributeScore - a.contributeScore || b.stars - a.stars,
  );
  const selected: Repo[] = [];
  const counts = new Map<string, number>();

  for (const repo of sorted) {
    if (selected.length >= BOARD_LIMITS.maxRepos) break;
    const cats = repo.categories.filter(
      (c) => (counts.get(c) ?? 0) < BOARD_LIMITS.maxReposPerCategory,
    );
    if (cats.length === 0) continue;
    const next: Repo = {
      ...repo,
      categories: cats,
      primaryCategory: cats.includes(repo.primaryCategory) ? repo.primaryCategory : cats[0],
      issues: repo.issues.slice(0, BOARD_LIMITS.maxIssuesPerRepo),
    };
    selected.push(next);
    for (const c of cats) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return selected;
}
