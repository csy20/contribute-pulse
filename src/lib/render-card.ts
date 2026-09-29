import {
  CATEGORY_NAME,
  type CategorySlug,
  type Repo,
} from "../../scripts/types.ts";
import {
  escapeHtml,
  formatScore,
  formatStars,
  relativeTime,
} from "./format.ts";
import { categoryPath, pathTo, repoPath } from "./paths.ts";
import { avatarSrcSet, avatarUrl, languageColor, PULSE_TICK } from "./ui.ts";

export function renderRepoCard(repo: Repo): string {
  const why = repo.why[0] ?? "Active project with room for contributors";
  const issue = repo.issues[0];
  const cats = repo.categories
    .slice(0, 2)
    .map(
      (c) =>
        `<a class="pill hover:text-ink" href="${escapeHtml(categoryPath(c))}">${escapeHtml(CATEGORY_NAME[c as CategorySlug] ?? c)}</a>`,
    )
    .join("");
  const lang = repo.language
    ? `<span class="pill"><span class="lang-dot" style="background:${languageColor(repo.language)}"></span>${escapeHtml(repo.language)}</span>`
    : "";
  const issueLink = issue
    ? `<a class="repo-issue" href="${escapeHtml(issue.url)}" rel="noopener noreferrer"><svg class="issue-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg><span><span class="issue-caption">STARTER ISSUE · #${issue.number}</span><span class="repo-issue-title" title="${escapeHtml(issue.title)}">${escapeHtml(issue.title)}</span></span><svg class="issue-arrow" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10"/></svg></a>`
    : "";
  const score = formatScore(repo.contributeScore);
  const scorePercent = Math.max(0, Math.min(100, repo.contributeScore));
  const ownerInitials = escapeHtml(repo.owner.slice(0, 2).toUpperCase());
  const desc = escapeHtml(repo.description);

  return `<article class="card repo-card">
    <div class="repo-card-heading">
      <a class="repo-identity" href="${escapeHtml(repoPath(repo.owner, repo.name))}">
        <span class="repo-avatar-wrap" aria-hidden="true"><span class="repo-avatar-fallback">${ownerInitials}</span><img src="${escapeHtml(avatarUrl(repo.owner, 80))}" srcset="${escapeHtml(avatarSrcSet(repo.owner))}" sizes="40px" alt="" width="40" height="40" class="repo-avatar" loading="lazy" /></span>
        <span class="repo-name-wrap"><span class="repo-owner">${escapeHtml(repo.owner)} /</span><span class="repo-name">${escapeHtml(repo.name)}</span></span>
      </a>
      <span class="repo-score" title="Contribute score ${escapeHtml(score)} out of 100 — freshness and maintainer activity weighted highest" aria-label="Pulse score ${escapeHtml(score)} out of 100"><svg class="repo-score-gauge" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle class="score-gauge-track" cx="16" cy="16" r="12.5" stroke-width="2.5"/><circle class="score-gauge-fill" cx="16" cy="16" r="12.5" stroke-width="2.5" pathLength="100" stroke-dasharray="${scorePercent} 100" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg><span class="repo-score-copy"><span class="repo-score-number">${escapeHtml(score)}</span><span class="repo-score-caption">Pulse / 100</span></span></span>
    </div>
    <p class="repo-description" title="${desc}">${desc}</p>
    <div class="repo-tags">${lang}${cats}</div>
    <p class="repo-signal">${PULSE_TICK}<span>${escapeHtml(why)}</span></p>
    <div class="repo-meta">
      <span><svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m10 2 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8L10 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>${escapeHtml(formatStars(repo.stars))}</span>
      <span><span class="repo-activity-dot" aria-hidden="true"></span>Pushed <time datetime="${escapeHtml(repo.pushedAt)}" data-relative>${escapeHtml(relativeTime(repo.pushedAt))}</time></span>
      <span>${repo.issues.length} ${repo.issues.length === 1 ? "starter issue" : "starter issues"}</span>
    </div>
    ${issueLink}
    <div class="repo-card-footer"><a class="repo-github" href="${escapeHtml(repo.url)}" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-4 1-4-2-6-2m12 6v-3.8c0-1 .1-1.6-.5-2.2 3.5-.4 7-1.7 7-7.1 0-1.5-.5-2.8-1.4-3.8.2-.7.2-2-.3-3.1 0 0-1.3-.4-4.2 1.6a15 15 0 0 0-7.6 0C5.1 1.6 3.8 2 3.8 2c-.5 1.1-.5 2.4-.3 3.1A5.8 5.8 0 0 0 2 8.9c0 5.4 3.5 6.7 7 7.1-.6.6-.5 1.3-.5 2.2V23"/></svg>Open on GitHub <span aria-hidden="true">↗</span></a><a class="repo-details" href="${escapeHtml(repoPath(repo.owner, repo.name))}">View details <span aria-hidden="true">→</span></a></div>
  </article>`;
}

export function renderEmptyState(
  kind: "filters" | "search" | "category",
): string {
  const copy =
    kind === "search"
      ? "No repositories match that search. Try a language, topic, or owner/name."
      : kind === "category"
        ? "Nothing in this category right now. The crawl only keeps licensed, recently pushed projects with starter labels."
        : "No repositories match these filters. Try clearing language, lowering min stars, or turning off “Beginner friendly only”.";
  const action =
    kind === "filters"
      ? `<button type="button" class="btn-ghost mt-4" data-clear-filters>Clear filters</button>`
      : kind === "search"
        ? `<a class="btn-ghost mt-4" href="${pathTo("")}">Back to the board</a>`
        : "";
  return `<div class="card col-span-full py-10 text-center">
    <p class="font-display text-[1.65rem] tracking-tight text-ink">Nothing here yet</p>
    <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-moss">${copy}</p>
    ${action}
  </div>`;
}

export function dataUrl(): string {
  return pathTo("data/latest.json");
}
