import { CATEGORY_NAME, type CategorySlug, type Repo } from "../../scripts/types.ts";
import { escapeHtml, formatScore, formatStars, relativeTime } from "./format.ts";
import { categoryPath, pathTo, repoPath } from "./paths.ts";
import { avatarSrcSet, avatarUrl, languageColor, PULSE_TICK, scoreCapsuleClass } from "./ui.ts";

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
    ? `<a class="text-sm text-moss hover:text-ink hover:underline" href="${escapeHtml(issue.url)}" rel="noopener noreferrer">Issue #${issue.number}</a>`
    : "";
  const score = formatScore(repo.contributeScore);
  const desc = escapeHtml(repo.description);

  return `<article class="card flex flex-col gap-3">
    <div class="flex items-start justify-between gap-3">
      <a class="flex min-w-0 items-center gap-2.5" href="${escapeHtml(repo.url)}" rel="noopener noreferrer">
        <img src="${escapeHtml(avatarUrl(repo.owner, 64))}" srcset="${escapeHtml(avatarSrcSet(repo.owner))}" sizes="28px" alt="" width="28" height="28" class="h-7 w-7 rounded-[6px] bg-panel-2" loading="lazy" />
        <span class="min-w-0 leading-snug">
          <span class="block truncate text-[13px] text-moss">${escapeHtml(repo.owner)}</span>
          <span class="block truncate font-medium text-ink">${escapeHtml(repo.name)}</span>
        </span>
      </a>
      <span class="${scoreCapsuleClass(repo.contributeScore)}" title="Contribute score ${escapeHtml(score)} out of 100 — freshness and maintainer activity weighted highest">${escapeHtml(score)}<span class="score-unit">/100</span></span>
    </div>
    <p class="line-clamp-2 text-sm leading-snug text-moss" title="${desc}">${desc}</p>
    <div class="flex flex-wrap gap-1.5">${lang}${cats}</div>
    <p class="flex gap-2 text-[13px] leading-snug text-ink/90">${PULSE_TICK}<span>${escapeHtml(why)}</span></p>
    <div class="grid grid-cols-3 gap-2 border-t border-line pt-3">
      <div class="meta-cell"><span class="lbl">Stars</span><span class="val">${escapeHtml(formatStars(repo.stars))}</span></div>
      <div class="meta-cell"><span class="lbl">Pushed</span><span class="val"><time datetime="${escapeHtml(repo.pushedAt)}" data-relative>${escapeHtml(relativeTime(repo.pushedAt))}</time></span></div>
      <div class="meta-cell"><span class="lbl">Issues</span><span class="val">${repo.issues.length}</span></div>
    </div>
    <div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
      <a class="btn-ghost text-xs" href="${escapeHtml(repo.url)}" rel="noopener noreferrer">Open on GitHub</a>
      ${issueLink}
      <a class="text-sm text-moss hover:text-ink hover:underline" href="${escapeHtml(repoPath(repo.owner, repo.name))}">Details</a>
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
