import { CATEGORY_NAME, type CategorySlug, type Repo } from "../../scripts/types.ts";

export type SortKey = "score" | "stars" | "pushed" | "issues";

export interface BoardFilters {
  query: string;
  language: string;
  minStars: number | null;
  maxStars: number | null;
  beginnerOnly: boolean;
  hasContributing: boolean;
  famousHard: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: BoardFilters = {
  query: "",
  language: "",
  minStars: null,
  maxStars: null,
  beginnerOnly: false,
  hasContributing: false,
  famousHard: false,
  sort: "score",
};

function searchHaystack(repo: Repo): string {
  return [
    repo.name,
    repo.owner,
    repo.fullName,
    repo.description,
    repo.language ?? "",
    ...repo.topics,
    ...repo.categories,
    ...repo.categories.map((c) => CATEGORY_NAME[c as CategorySlug] ?? c),
    ...repo.issues.flatMap((i) => [i.title, ...i.labels]),
  ]
    .join(" ")
    .toLowerCase();
}

export function searchRepos(repos: Repo[], query: string): Repo[] {
  const raw = query.toLowerCase().trim();
  if (!raw) return repos;
  const terms = raw.split(/\s+/).filter(Boolean);
  return repos.filter((repo) => {
    const hay = searchHaystack(repo);
    if (hay.includes(raw)) return true;
    return terms.every((term) => hay.includes(term));
  });
}

export function applyFilters(repos: Repo[], filters: BoardFilters): Repo[] {
  let next = repos;
  if (!filters.famousHard) {
    next = next.filter((r) => !r.famousHard && r.stars <= 80_000);
  }
  if (filters.language) {
    next = next.filter((r) => (r.language ?? "") === filters.language);
  }
  if (filters.minStars != null) next = next.filter((r) => r.stars >= filters.minStars!);
  if (filters.maxStars != null) next = next.filter((r) => r.stars <= filters.maxStars!);
  if (filters.beginnerOnly) {
    next = next.filter((r) => r.issues.some((i) => i.isGoodFirst));
  }
  if (filters.hasContributing) next = next.filter((r) => r.hasContributing);
  if (filters.query.trim()) next = searchRepos(next, filters.query);

  const sorted = [...next];
  switch (filters.sort) {
    case "stars":
      sorted.sort((a, b) => b.stars - a.stars);
      break;
    case "pushed":
      sorted.sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt));
      break;
    case "issues":
      sorted.sort((a, b) => b.issues.length - a.issues.length || b.contributeScore - a.contributeScore);
      break;
    default:
      sorted.sort((a, b) => b.contributeScore - a.contributeScore || b.stars - a.stars);
  }
  return sorted;
}

export function languagesIn(repos: Repo[]): string[] {
  return [...new Set(repos.map((r) => r.language).filter((x): x is string => Boolean(x)))].sort((a, b) =>
    a.localeCompare(b),
  );
}
