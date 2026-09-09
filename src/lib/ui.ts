import type { CategorySlug } from "../../scripts/types.ts";

export const CATEGORY_MARK: Record<CategorySlug, string> = {
  "ai-ml": "AI",
  data: "DA",
  web: "WE",
  backend: "BE",
  mobile: "MO",
  devops: "DV",
  systems: "SY",
  languages: "LG",
  "developer-tools": "DT",
  security: "SE",
  gamedev: "GD",
  design: "DS",
  docs: "DO",
  "social-good": "SG",
  other: "OT",
};

const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  Go: "#00add8",
  Kotlin: "#a97bff",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#f05138",
  Dart: "#00b4ab",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Shell: "#89e051",
  Zig: "#ec915c",
  Scala: "#c22d40",
  Haskell: "#5e5086",
  Lua: "#000080",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  YAML: "#cb171e",
};

export function languageColor(lang: string | null | undefined): string {
  if (!lang) return "#a3a990";
  return LANGUAGE_COLORS[lang] ?? "#a3a990";
}

export function avatarUrl(owner: string, size = 64): string {
  return `https://github.com/${encodeURIComponent(owner)}.png?size=${size}`;
}

export const PULSE_TICK = `<svg class="why-tick" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h2.1l1-3.2L6.2 10l1.3-4H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
