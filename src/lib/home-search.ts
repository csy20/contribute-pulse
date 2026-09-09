import type { LatestData } from "../../scripts/types.ts";
import { loadLatest, hydrateRelativeTimes } from "./client-data.ts";
import { applyFilters, DEFAULT_FILTERS } from "./search.ts";
import { renderEmptyState, renderRepoCard } from "./render-card.ts";

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let t = 0;
  return ((...args: never[]) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  }) as T;
}

const EMPTY: LatestData = {
  generatedAt: "",
  source: "sample",
  repoCount: 0,
  issueCount: 0,
  categories: [],
  repos: [],
};

export function initHomeSearch() {
  const input = document.querySelector<HTMLInputElement>("[data-home-search]");
  const headerInput = document.querySelector<HTMLInputElement>("[data-header-search]");
  const results = document.querySelector<HTMLElement>("[data-search-results]");
  const grid = document.querySelector<HTMLElement>("[data-search-grid]");
  const heading = document.querySelector<HTMLElement>("[data-search-heading]");
  const rest = document.querySelector<HTMLElement>("[data-home-default]");
  if (!input || !results || !grid || !rest) return;

  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") ?? "";
  if (initial) {
    input.value = initial;
    if (headerInput) headerInput.value = initial;
  }

  const run = async (raw: string) => {
    const q = raw.trim();
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);

    if (!q) {
      results.hidden = true;
      rest.hidden = false;
      return;
    }

    rest.hidden = true;
    results.hidden = false;
    const data = await loadLatest(EMPTY);
    const rows = applyFilters(data.repos, { ...DEFAULT_FILTERS, query: q });
    if (heading) heading.textContent = `${rows.length} ${rows.length === 1 ? "match" : "matches"} for “${q}”`;
    grid.innerHTML = rows.length ? rows.map(renderRepoCard).join("") : renderEmptyState("search");
    hydrateRelativeTimes(grid);
  };

  const debounced = debounce((value: string) => {
    void run(value);
  }, 150);

  input.addEventListener("input", () => {
    if (headerInput && headerInput !== input) headerInput.value = input.value;
    debounced(input.value);
  });
  if (headerInput) {
    headerInput.addEventListener("input", () => {
      input.value = headerInput.value;
      debounced(headerInput.value);
    });
  }

  document.querySelectorAll<HTMLButtonElement>("[data-search-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = chip.dataset.searchChip ?? "";
      input.value = value;
      if (headerInput) headerInput.value = value;
      input.focus();
      void run(value);
    });
  });

  if (initial) void run(initial);
  else void loadLatest(EMPTY);
}
