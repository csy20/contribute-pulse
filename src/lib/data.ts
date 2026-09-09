import latestJson from "../../data/latest.json";
import { CATEGORY_DEFS, type CategorySlug, type LatestData, type Repo } from "../../scripts/types.ts";

export const latest = latestJson as LatestData;
export { CATEGORY_DEFS };

export function defaultBoard(repos: Repo[] = latest.repos): Repo[] {
  return repos.filter((r) => !r.famousHard && r.stars <= 80_000);
}

export function featuredRepos(repos: Repo[] = latest.repos, n = 8): Repo[] {
  return [...defaultBoard(repos)].sort((a, b) => b.contributeScore - a.contributeScore).slice(0, n);
}

export function reposForCategory(
  slug: CategorySlug,
  repos: Repo[] = latest.repos,
  includeFamous = false,
): Repo[] {
  return repos
    .filter((r) => r.categories.includes(slug))
    .filter((r) => includeFamous || (!r.famousHard && r.stars <= 80_000))
    .sort((a, b) => b.contributeScore - a.contributeScore);
}

export function categoryCounts(repos: Repo[] = latest.repos) {
  const board = defaultBoard(repos);
  return CATEGORY_DEFS.map((def) => ({
    ...def,
    count: board.filter((r) => r.categories.includes(def.slug)).length,
  }));
}

export function pulseStats(repos: Repo[] = latest.repos) {
  const board = defaultBoard(repos);
  return {
    repoCount: latest.repoCount || board.length,
    issueCount: latest.issueCount || board.reduce((n, r) => n + r.issues.length, 0),
    languages: new Set(board.map((r) => r.language).filter(Boolean)).size,
    contributing: board.filter((r) => r.hasContributing).length,
  };
}

export function findRepo(owner: string, name: string, repos: Repo[] = latest.repos): Repo | undefined {
  const key = `${owner}/${name}`.toLowerCase();
  return repos.find((r) => r.fullName.toLowerCase() === key);
}

export function isStale(generatedAt: string, now = Date.now(), hours = 36): boolean {
  const then = new Date(generatedAt).getTime();
  if (Number.isNaN(then)) return true;
  return now - then > hours * 3_600_000;
}
