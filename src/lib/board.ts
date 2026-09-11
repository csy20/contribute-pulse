import type { CategorySlug, LatestData, Repo } from "../../scripts/types.ts";
import { loadLatest, hydrateRelativeTimes } from "./client-data.ts";
import { applyFilters, languagesIn, type BoardFilters, type SortKey } from "./search.ts";
import { renderEmptyState, renderRepoCard } from "./render-card.ts";

function numOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function readFilters(form: HTMLFormElement): BoardFilters {
  const data = new FormData(form);
  return {
    query: "",
    language: String(data.get("language") ?? ""),
    minStars: numOrNull(String(data.get("minStars") ?? "")),
    maxStars: numOrNull(String(data.get("maxStars") ?? "")),
    beginnerOnly: data.get("beginnerOnly") === "on",
    hasContributing: data.get("hasContributing") === "on",
    famousHard: data.get("famousHard") === "on",
    sort: (String(data.get("sort") ?? "score") as SortKey) || "score",
  };
}

function fillLanguages(select: HTMLSelectElement, repos: Repo[], current: string) {
  const langs = languagesIn(repos);
  const keepFirst = select.querySelector("option")?.outerHTML ?? `<option value="">Any language</option>`;
  select.innerHTML =
    keepFirst + langs.map((l) => `<option value="${l.replace(/"/g, "&quot;")}">${l}</option>`).join("");
  if (current && langs.includes(current)) select.value = current;
}

export function initBoard() {
  const root = document.querySelector<HTMLElement>("[data-board]");
  const form = document.querySelector<HTMLFormElement>("[data-filters]");
  const grid = document.querySelector<HTMLElement>("[data-grid]");
  const count = document.querySelector<HTMLElement>("[data-count]");
  if (!root || !form || !grid) return;
  const category = root.dataset.category as CategorySlug;
  let snapshot: LatestData | null = null;

  const categoryRepos = (data: LatestData) =>
    data.repos.filter((r) => r.categories.includes(category));

  const render = (data: LatestData) => {
    snapshot = data;
    const filters = readFilters(form);
    const source = categoryRepos(data);
    const langSelect = form.querySelector<HTMLSelectElement>("[name=language]");
    if (langSelect) fillLanguages(langSelect, source, filters.language);
    const rows = applyFilters(source, filters);
    grid.innerHTML = rows.length
      ? rows.map(renderRepoCard).join("")
      : renderEmptyState(source.length ? "filters" : "category");
    if (count) {
      count.textContent = `${rows.length} ${rows.length === 1 ? "repo" : "repos"}`;
    }
    hydrateRelativeTimes(grid);
  };

  const refresh = () => {
    if (snapshot) {
      render(snapshot);
      return;
    }
    void loadLatest().then((data) => {
      if (data) render(data);
    });
  };

  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  grid.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest("[data-clear-filters]")) return;
    form.reset();
    refresh();
  });

  void loadLatest().then((data) => {
    if (data) render(data);
  });
}
