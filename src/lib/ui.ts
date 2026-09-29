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

// Only trusted, static SVG shapes are used in markup rendered by categoryIcon.
const CATEGORY_ICON_SHAPES: Record<CategorySlug, string> = {
  "ai-ml":
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/><path d="M20 2v4M18 4h4"/>',
  data: '<path d="M4 3v17h17"/><path d="M8 16v-5M13 16V7M18 16V4"/>',
  web: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  backend: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  mobile:
    '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10 5h4M11 18.5h2"/>',
  devops:
    '<path d="M7 18H6a4 4 0 0 1-.6-7.95A6.5 6.5 0 0 1 18 8.5a4.75 4.75 0 0 1 .25 9.5H17"/><path d="M12 21V12m-3 3 3-3 3 3"/>',
  systems:
    '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  languages: '<path d="m7 6-5 6 5 6M17 6l5 6-5 6M14 4l-4 16"/>',
  "developer-tools":
    '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  security:
    '<path d="m12 3 8 3v6c0 4.5-4.5 7.5-8 9-3.5-1.5-8-4.5-8-9V6l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  gamedev:
    '<path d="M7.5 7h9a4 4 0 0 1 4 3.5l1 6.3a2.5 2.5 0 0 1-4.2 2.2L14 16h-4l-3.3 3a2.5 2.5 0 0 1-4.2-2.2l1-6.3A4 4 0 0 1 7.5 7Z"/><path d="M7 10v5M4.5 12.5h5M16 11h.01M18.5 13.5h.01"/>',
  design:
    '<path d="m12 3 8 8-6 9-10-1-1-10 9-6ZM3 9l7 7M15 6l3-3 3 3-3 3"/><circle cx="12" cy="14" r="2"/>',
  docs: '<path d="M12 5v16M12 5C9 3 5 3 3 4v15c2-1 6-1 9 2 3-3 7-3 9-2V4c-2-1-6-1-9 1Z"/><path d="M6 8h3M15 8h3"/>',
  "social-good":
    '<path d="M20.7 5.3a5 5 0 0 0-7.1 0L12 6.9l-1.6-1.6a5 5 0 0 0-7.1 7.1L12 21l8.7-8.6a5 5 0 0 0 0-7.1Z"/>',
  other:
    '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
};

export function categoryIcon(slug: CategorySlug): string {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${CATEGORY_ICON_SHAPES[slug]}</svg>`;
}

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

export function avatarSrcSet(owner: string): string {
  return `${avatarUrl(owner, 40)} 40w, ${avatarUrl(owner, 80)} 80w`;
}

export function scoreCapsuleClass(score: number): string {
  return score >= 90 ? "score-capsule score-capsule--hot" : "score-capsule";
}

export const PULSE_TICK = `<svg class="why-tick" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h2.1l1-3.2L6.2 10l1.3-4H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
