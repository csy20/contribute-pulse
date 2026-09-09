import { CATEGORY_NAME, type CategorySlug, type LatestData } from "../../scripts/types.ts";
import { loadLatest, hydrateRelativeTimes } from "./client-data.ts";
import { categoryPath } from "./paths.ts";
import { applyFilters, DEFAULT_FILTERS, type SortKey } from "./search.ts";
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
  const sortSelect = document.querySelector<HTMLSelectElement>("[data-search-sort]");
  const catRow = document.querySelector<HTMLElement>("[data-search-cats]");
  if (!input || !results || !grid || !rest) return;

  const currentSort = (): SortKey => (sortSelect?.value as SortKey) || "score";

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
    const rows = applyFilters(data.repos, { ...DEFAULT_FILTERS, query: q, sort: currentSort() });
    if (heading) heading.textContent = `${rows.length} ${rows.length === 1 ? "match" : "matches"} for “${q}”`;
    if (catRow) {
      const slugs = [...new Set(rows.flatMap((r) => r.categories))].slice(0, 6) as CategorySlug[];
      catRow.innerHTML = slugs
        .map(
          (slug) =>
            `<a class="pill hover:text-ink" href="${categoryPath(slug)}">${CATEGORY_NAME[slug]}</a>`,
        )
        .join("");
    }
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

  input.closest("form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    void run(input.value);
  });
  sortSelect?.addEventListener("change", () => {
    if (input.value.trim()) void run(input.value);
  });

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
