import type { CategorySlug } from "./types.ts";

export { CATEGORY_DEFS, CATEGORY_NAME } from "./types.ts";

/** Topic tokens (already hyphen/lowercase) mapped to categories. */
export const TOPIC_CATEGORY_MAP: Record<string, CategorySlug[]> = {
  // AI / ML
  "machine-learning": ["ai-ml"],
  machinelearning: ["ai-ml"],
  ml: ["ai-ml"],
  llm: ["ai-ml"],
  llms: ["ai-ml"],
  pytorch: ["ai-ml"],
  tensorflow: ["ai-ml"],
  keras: ["ai-ml"],
  nlp: ["ai-ml"],
  "natural-language-processing": ["ai-ml"],
  "computer-vision": ["ai-ml"],
  computervision: ["ai-ml"],
  "deep-learning": ["ai-ml"],
  deeplearning: ["ai-ml"],
  "generative-ai": ["ai-ml"],
  generativeai: ["ai-ml"],
  transformers: ["ai-ml"],
  huggingface: ["ai-ml"],
  langchain: ["ai-ml"],
  openai: ["ai-ml"],
  "neural-network": ["ai-ml"],
  diffusion: ["ai-ml"],
  "stable-diffusion": ["ai-ml"],
  onnx: ["ai-ml"],
  whisper: ["ai-ml"],
  llama: ["ai-ml"],
  rag: ["ai-ml"],
  embedding: ["ai-ml"],
  embeddings: ["ai-ml"],
  mlops: ["ai-ml"],
  "artificial-intelligence": ["ai-ml"],
  "scikit-learn": ["ai-ml"],
  jax: ["ai-ml"],
  "object-detection": ["ai-ml"],
  speech: ["ai-ml"],
  "large-language-models": ["ai-ml"],
  chatgpt: ["ai-ml"],
  agent: ["ai-ml"],
  agents: ["ai-ml"],
  vllm: ["ai-ml"],
  gguf: ["ai-ml"],
  ollama: ["ai-ml"],

  // Data
  "data-science": ["data"],
  datascience: ["data"],
  analytics: ["data"],
  pandas: ["data"],
  spark: ["data"],
  etl: ["data"],
  "data-engineering": ["data"],
  dataengineering: ["data"],
  visualization: ["data"],
  jupyter: ["data"],
  airflow: ["data"],
  dbt: ["data"],
  duckdb: ["data"],
  clickhouse: ["data"],
  "data-viz": ["data"],
  dataviz: ["data"],
  dataframe: ["data"],
  warehouse: ["data"],
  "business-intelligence": ["data"],
  bi: ["data"],
  prometheus: ["data", "devops"],
  grafana: ["data", "devops"],
  elasticsearch: ["data"],

  // Web
  react: ["web"],
  reactjs: ["web"],
  nextjs: ["web"],
  "next-js": ["web"],
  vue: ["web"],
  vuejs: ["web"],
  svelte: ["web"],
  sveltekit: ["web"],
  tailwind: ["web"],
  tailwindcss: ["web"],
  frontend: ["web"],
  "front-end": ["web"],
  css: ["web"],
  html: ["web"],
  angular: ["web"],
  astro: ["web"],
  remix: ["web"],
  nuxt: ["web"],
  webpack: ["web"],
  vite: ["web", "developer-tools"],
  typescript: ["web", "languages"],
  javascript: ["web"],
  ui: ["web", "design"],
  "web-components": ["web"],
  "css-framework": ["web"],
  "static-site-generator": ["web"],

  // Backend
  api: ["backend"],
  graphql: ["backend"],
  backend: ["backend"],
  "back-end": ["backend"],
  django: ["backend"],
  rails: ["backend"],
  spring: ["backend"],
  nestjs: ["backend"],
  fastapi: ["backend"],
  express: ["backend"],
  flask: ["backend"],
  laravel: ["backend"],
  grpc: ["backend"],
  rest: ["backend"],
  microservice: ["backend"],
  microservices: ["backend"],
  server: ["backend"],
  database: ["backend", "data"],
  postgres: ["backend", "data"],
  postgresql: ["backend", "data"],
  redis: ["backend"],
  mongodb: ["backend", "data"],

  // Mobile
  android: ["mobile"],
  ios: ["mobile"],
  flutter: ["mobile"],
  "react-native": ["mobile"],
  reactnative: ["mobile"],
  "kotlin-multiplatform": ["mobile"],
  kmp: ["mobile"],
  swiftui: ["mobile"],
  swift: ["mobile"],
  kotlin: ["mobile"],
  jetpack: ["mobile"],
  compose: ["mobile"],
  "jetpack-compose": ["mobile"],
  xamarin: ["mobile"],
  maui: ["mobile"],
  cordova: ["mobile"],
  ionic: ["mobile"],

  // DevOps
  kubernetes: ["devops"],
  k8s: ["devops"],
  docker: ["devops"],
  terraform: ["devops"],
  ansible: ["devops"],
  "ci-cd": ["devops"],
  cicd: ["devops"],
  aws: ["devops"],
  gcp: ["devops"],
  azure: ["devops"],
  devops: ["devops"],
  helm: ["devops"],
  pulumi: ["devops"],
  nix: ["devops", "developer-tools"],
  nixos: ["devops", "systems"],
  observability: ["devops"],
  infrastructure: ["devops"],
  iac: ["devops"],
  sre: ["devops"],
  cloud: ["devops"],
  "github-actions": ["devops"],

  // Systems
  compiler: ["systems", "languages"],
  os: ["systems"],
  kernel: ["systems"],
  embedded: ["systems"],
  "operating-system": ["systems"],
  "device-driver": ["systems"],
  firmware: ["systems"],
  rtost: ["systems"],
  rtos: ["systems"],
  wasm: ["systems", "web"],
  webassembly: ["systems", "web"],
  llvm: ["systems", "languages"],
  qemu: ["systems"],
  baremetal: ["systems"],
  "bare-metal": ["systems"],
  microcontroller: ["systems"],
  zig: ["systems", "languages"],

  // Languages
  "programming-language": ["languages"],
  lsp: ["languages", "developer-tools"],
  "language-server": ["languages", "developer-tools"],
  interpreter: ["languages"],
  parser: ["languages"],
  grammar: ["languages"],
  codegen: ["languages"],
  "type-system": ["languages"],
  runtime: ["languages"],

  // Developer tools
  cli: ["developer-tools"],
  vscode: ["developer-tools"],
  "vscode-extension": ["developer-tools"],
  editor: ["developer-tools"],
  linter: ["developer-tools"],
  formatter: ["developer-tools"],
  "developer-tools": ["developer-tools"],
  neovim: ["developer-tools"],
  vim: ["developer-tools"],
  emacs: ["developer-tools"],
  tmux: ["developer-tools"],
  zsh: ["developer-tools"],
  shell: ["developer-tools"],
  terminal: ["developer-tools"],
  git: ["developer-tools"],
  eslint: ["developer-tools"],
  prettier: ["developer-tools"],
  biome: ["developer-tools"],
  bundler: ["developer-tools"],
  "build-tool": ["developer-tools"],
  debugging: ["developer-tools"],
  testing: ["developer-tools"],

  // Security
  security: ["security"],
  cybersecurity: ["security"],
  pentest: ["security"],
  "penetration-testing": ["security"],
  vulnerability: ["security"],
  auth: ["security"],
  authentication: ["security"],
  cryptography: ["security"],
  crypto: ["security"],
  oauth: ["security"],
  malware: ["security"],
  "static-analysis": ["security", "developer-tools"],
  cve: ["security"],
  infosec: ["security"],
  encryption: ["security"],

  // Game
  game: ["gamedev"],
  gamedev: ["gamedev"],
  "game-development": ["gamedev"],
  unity: ["gamedev"],
  godot: ["gamedev"],
  unreal: ["gamedev"],
  "unreal-engine": ["gamedev"],
  gdscript: ["gamedev"],
  bevy: ["gamedev"],
  pygame: ["gamedev"],
  "pixel-art": ["gamedev", "design"],
  multiplayer: ["gamedev"],

  // Design
  design: ["design"],
  "ui-kit": ["design"],
  uikit: ["design"],
  figma: ["design"],
  icons: ["design"],
  "design-system": ["design"],
  "icon-pack": ["design"],
  fonts: ["design"],
  illustration: ["design"],
  svg: ["design"],
  "color-palette": ["design"],

  // Docs
  documentation: ["docs"],
  docs: ["docs"],
  education: ["docs"],
  tutorial: ["docs"],
  awesome: ["docs"],
  learn: ["docs"],
  course: ["docs"],
  book: ["docs"],
  blog: ["docs"],
  content: ["docs"],
  markdown: ["docs"],

  // Social good
  civic: ["social-good"],
  climate: ["social-good"],
  nonprofit: ["social-good"],
  "social-impact": ["social-good"],
  "open-government": ["social-good"],
  humanitarian: ["social-good"],
  accessibility: ["social-good", "web"],
  a11y: ["social-good", "web"],
  healthcare: ["social-good"],
  "public-good": ["social-good"],
  "climate-change": ["social-good"],
};

const DESCRIPTION_KEYWORDS: Array<{ re: RegExp; cats: CategorySlug[]; weight: number }> = [
  { re: /\b(machine learning|deep learning|llm|large language|pytorch|tensorflow|neural net|computer vision|nlp)\b/i, cats: ["ai-ml"], weight: 2 },
  { re: /\b(data(?:frame|set)?s?|analytics|etl|spark|pandas|warehouse|dashboard)\b/i, cats: ["data"], weight: 1 },
  { re: /\b(react|next\.?js|vue|svelte|frontend|front-end|css|tailwind|dom)\b/i, cats: ["web"], weight: 2 },
  { re: /\b(api|graphql|backend|restful|microservice|fastapi|django|server-side)\b/i, cats: ["backend"], weight: 2 },
  { re: /\b(android|ios|flutter|react native|swiftui|mobile app|kotlin multiplatform)\b/i, cats: ["mobile"], weight: 2 },
  { re: /\b(kubernetes|terraform|docker|devops|ci\/cd|infrastructure as code|helm chart)\b/i, cats: ["devops"], weight: 2 },
  { re: /\b(kernel|operating system|embedded|firmware|bootloader|hypervisor)\b/i, cats: ["systems"], weight: 2 },
  { re: /\b(compiler|programming language|language server|interpreter|type checker)\b/i, cats: ["languages"], weight: 2 },
  { re: /\b(command[- ]line|cli tool|vscode extension|linter|formatter|neovim)\b/i, cats: ["developer-tools"], weight: 2 },
  { re: /\b(security|vulnerabilit(?:y|ies)|cve|cryptograph|oauth|penetration test)\b/i, cats: ["security"], weight: 2 },
  { re: /\b(game engine|gamedev|unity|godot|unreal|video game)\b/i, cats: ["gamedev"], weight: 2 },
  { re: /\b(design system|ui kit|icon set|figma|icon pack)\b/i, cats: ["design"], weight: 2 },
  { re: /\b(documentation|tutorial|curriculum|learn to|awesome list)\b/i, cats: ["docs"], weight: 1 },
  { re: /\b(civic|nonprofit|climate|humanitarian|social impact|open government)\b/i, cats: ["social-good"], weight: 2 },
];

const SYSTEMS_LANGUAGES = new Set(["c", "c++", "rust", "zig", "assembly", "nim"]);
const MOBILE_LANGUAGES = new Set(["swift", "kotlin", "dart", "objective-c", "java"]);
const WEB_LANGUAGES = new Set(["javascript", "typescript", "css", "html", "vue", "svelte"]);

export interface ClassifyInput {
  topics: string[];
  language: string | null;
  description: string;
  name?: string;
}

export interface ClassifyResult {
  categories: CategorySlug[];
  primaryCategory: CategorySlug;
  confidence: "high" | "low";
  scores: Partial<Record<CategorySlug, number>>;
}

function bump(scores: Map<CategorySlug, number>, slug: CategorySlug, amount: number) {
  scores.set(slug, (scores.get(slug) ?? 0) + amount);
}

function normalizeTopic(topic: string): string {
  return topic.toLowerCase().trim().replace(/[_\s]+/g, "-");
}

/**
 * Assign one or more board categories from GitHub topics, language, and description.
 * Low-confidence guesses are stored in `other` AND the best-guess category.
 */
export function classifyRepo(input: ClassifyInput): ClassifyResult {
  const scores = new Map<CategorySlug, number>();
  const topics = (input.topics ?? []).map(normalizeTopic);
  const language = (input.language ?? "").trim();
  const langKey = language.toLowerCase();
  const description = input.description ?? "";
  const name = (input.name ?? "").toLowerCase();

  for (const topic of topics) {
    const mapped = TOPIC_CATEGORY_MAP[topic];
    if (mapped) {
      for (const cat of mapped) bump(scores, cat, 3);
    }
  }

  for (const rule of DESCRIPTION_KEYWORDS) {
    if (rule.re.test(description) || rule.re.test(name)) {
      for (const cat of rule.cats) bump(scores, cat, rule.weight);
    }
  }

  if (WEB_LANGUAGES.has(langKey)) bump(scores, "web", 1);
  if (MOBILE_LANGUAGES.has(langKey)) bump(scores, "mobile", 1);
  if (langKey === "go" || langKey === "golang") bump(scores, "backend", 1);
  if (langKey === "python") {
    // Weak: python is everywhere. Only nudge if something else already scored.
    if ((scores.get("ai-ml") ?? 0) + (scores.get("data") ?? 0) + (scores.get("backend") ?? 0) > 0) {
      /* already categorized */
    }
  }

  const systemsHint = topics.some((t) =>
    ["compiler", "os", "kernel", "embedded", "operating-system", "firmware", "driver"].includes(t),
  );
  if (SYSTEMS_LANGUAGES.has(langKey) && systemsHint) {
    bump(scores, "systems", 3);
  } else if (SYSTEMS_LANGUAGES.has(langKey)) {
    bump(scores, "systems", 1);
  }

  const ranked = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  if (ranked.length === 0) {
    return {
      categories: ["other"],
      primaryCategory: "other",
      confidence: "low",
      scores: { other: 0 },
    };
  }

  const primaryCategory = ranked[0][0];
  const topScore = ranked[0][1];
  const confidence: "high" | "low" = topScore >= 2 ? "high" : "low";

  const categories: CategorySlug[] = ranked
    .filter(([, score]) => score >= 2 || score === topScore)
    .map(([slug]) => slug);

  if (confidence === "low" && !categories.includes("other")) {
    categories.push("other");
  }

  return {
    categories,
    primaryCategory,
    confidence,
    scores: Object.fromEntries(ranked) as Partial<Record<CategorySlug, number>>,
  };
}

/** Search shards used by the crawler. Edit this to add a category mapping. */
export function searchShardsForCategory(slug: CategorySlug): string[] {
  const shards: Record<CategorySlug, string[]> = {
    "ai-ml": [
      "topic:machine-learning",
      "topic:llm",
      "topic:pytorch",
      "topic:computer-vision",
      "topic:nlp",
      "language:Python topic:deep-learning",
    ],
    data: [
      "topic:data-science",
      "topic:data-engineering",
      "topic:etl",
      "topic:pandas",
      "language:Python topic:analytics",
    ],
    web: [
      "topic:react",
      "topic:nextjs",
      "topic:vue",
      "topic:svelte",
      "topic:frontend",
      "topic:tailwindcss",
    ],
    backend: [
      "topic:graphql",
      "topic:fastapi",
      "topic:backend",
      "topic:microservices",
      "language:Go topic:api",
    ],
    mobile: [
      "topic:android",
      "topic:ios",
      "topic:flutter",
      "topic:react-native",
      "topic:kotlin-multiplatform",
    ],
    devops: [
      "topic:kubernetes",
      "topic:terraform",
      "topic:devops",
      "topic:docker",
      "topic:helm",
    ],
    systems: [
      "topic:embedded",
      "topic:kernel",
      "topic:operating-system",
      "language:Rust topic:compiler",
      "language:Zig",
      "language:C topic:os",
    ],
    languages: [
      "topic:programming-language",
      "topic:compiler",
      "topic:language-server",
      "topic:interpreter",
    ],
    "developer-tools": [
      "topic:cli",
      "topic:vscode-extension",
      "topic:neovim",
      "topic:linter",
      "topic:developer-tools",
    ],
    security: [
      "topic:security",
      "topic:cybersecurity",
      "topic:cryptography",
      "topic:vulnerability",
    ],
    gamedev: [
      "topic:gamedev",
      "topic:godot",
      "topic:unity",
      "topic:game-development",
      "topic:bevy",
    ],
    design: [
      "topic:design-system",
      "topic:ui-kit",
      "topic:icons",
      "topic:figma",
    ],
    docs: [
      "topic:documentation",
      "topic:education",
      "topic:awesome",
      "topic:tutorial",
    ],
    "social-good": [
      "topic:civic-tech",
      "topic:climate",
      "topic:nonprofit",
      "topic:social-impact",
    ],
    other: ["topic:hacktoberfest stars:200..5000"],
  };
  return shards[slug];
}
