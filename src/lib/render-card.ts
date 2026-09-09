import { CATEGORY_NAME, type CategorySlug, type Repo } from "../../scripts/types.ts";
import { escapeHtml, formatScore, formatStars, relativeTime } from "./format.ts";
import { categoryPath, pathTo, repoPath } from "./paths.ts";

export function renderRepoCard(repo: Repo): string {
  const why = repo.why[0] ?? "Active project with room for contributors";
  const issue = repo.issues[0];
  const cats = repo.categories
    .slice(0, 3)
    .map(
      (c) =>
        `<a class="pill hover:text-ink" href="${escapeHtml(categoryPath(c))}">${escapeHtml(CATEGORY_NAME[c as CategorySlug] ?? c)}</a>`,
    )
    .join("");
  const lang = repo.language ? `<span class="pill">${escapeHtml(repo.language)}</span>` : "";
  const issueLink = issue
    ? `<a class="text-sm text-moss hover:text-lime" href="${escapeHtml(issue.url)}" rel="noopener noreferrer">Issue #${issue.number}</a>`
    : "";

  return `<article class="card flex flex-col gap-3">
    <div class="flex items-start justify-between gap-3">
      <a class="font-medium leading-snug hover:text-lime" href="${escapeHtml(repo.url)}" rel="noopener noreferrer">${escapeHtml(repo.fullName)}</a>
      <span class="font-mono text-lime tabular-nums" title="Contribute score">${escapeHtml(formatScore(repo.contributeScore))}</span>
    </div>
    <p class="line-clamp-2 text-sm leading-relaxed text-moss">${escapeHtml(repo.description)}</p>
    <div class="flex flex-wrap gap-1.5">${lang}${cats}</div>
    <p class="text-sm text-ink/90">${escapeHtml(why)}</p>
    <p class="text-xs text-moss">
      ★ ${escapeHtml(formatStars(repo.stars))}
      · pushed <time datetime="${escapeHtml(repo.pushedAt)}" data-relative>${escapeHtml(relativeTime(repo.pushedAt))}</time>
      · ${repo.issues.length} starter ${repo.issues.length === 1 ? "issue" : "issues"}
    </p>
    <div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
      <a class="text-sm text-lime hover:underline" href="${escapeHtml(repo.url)}" rel="noopener noreferrer">GitHub</a>
      ${issueLink}
      <a class="text-sm text-moss hover:text-ink" href="${escapeHtml(repoPath(repo.owner, repo.name))}">Score details</a>
    </div>
  </article>`;
}

export function renderEmptyState(kind: "filters" | "search" | "category"): string {
  const copy =
    kind === "search"
      ? "No repositories match that search. Try a language, topic, or owner/name."
      : kind === "category"
        ? "Nothing in this category right now. The daily crawl only keeps licensed, recently pushed projects with starter labels."
        : "No repositories match these filters. Try clearing language, lowering min stars, or turning off “Beginner friendly only”.";
  return `<div class="card col-span-full text-center">
    <p class="font-display text-xl text-ink">Nothing here yet</p>
    <p class="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-moss">${copy}</p>
  </div>`;
}

export function dataUrl(): string {
  return pathTo("data/latest.json");
}
