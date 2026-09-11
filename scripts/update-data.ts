import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORY_DEFS, classifyRepo, searchShardsForCategory } from "./category-map.ts";
import { GithubClient, type GraphqlIssue, type GraphqlRepo, type SearchRepoHit } from "./github.ts";
import {
  capBoard,
  daysBetween,
  isContributorLabel,
  isGoodFirstLabel,
  isHelpWantedLabel,
  passesHardFilters,
  scoreRepo,
} from "./scoring.ts";
import {
  BOARD_LIMITS,
  CONTRIBUTOR_LABELS,
  SCORE_WEIGHTS,
  type CategoriesFile,
  type CategorySlug,
  type Issue,
  type LatestData,
  type MetaFile,
  type Repo,
} from "./types.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = resolve(ROOT, "data");
const JOB_BUDGET_MS = 11 * 60 * 1000;
const BATCH_SIZE = 4;
const MAX_CANDIDATES = 520;
const MAX_FAMOUS = 25;
const MAX_PER_SEARCH_CATEGORY = 40;
const SEARCH_PER_PAGE = 25;

function loadDotEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(ROOT, file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function uniqueKey(owner: string, name: string): string {
  return `${owner}/${name}`.toLowerCase();
}

function mapIssue(node: GraphqlIssue): Issue {
  const labels = node.labels.nodes.map((l) => l.name);
  return {
    number: node.number,
    title: node.title,
    url: node.url,
    labels,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    comments: node.comments.totalCount,
    isAssigned: node.assignees.totalCount > 0,
    isGoodFirst: labels.some(isGoodFirstLabel),
    isHelpWanted: labels.some(isHelpWantedLabel),
  };
}

function collectIssues(gql: GraphqlRepo): Issue[] {
  const merged = new Map<number, Issue>();
  for (const group of [gql.goodFirstIssues.nodes, gql.helpWantedIssues.nodes, gql.recentIssues.nodes]) {
    for (const node of group) {
      const issue = mapIssue(node);
      if (!issue.labels.some(isContributorLabel)) continue;
      const prev = merged.get(issue.number);
      if (!prev) merged.set(issue.number, issue);
    }
  }
  return [...merged.values()].sort((a, b) => {
    const au = a.isAssigned ? 1 : 0;
    const bu = b.isAssigned ? 1 : 0;
    if (au !== bu) return au - bu;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function mergedPrsLast30(gql: GraphqlRepo, now: Date): number | null {
  const nodes = gql.mergedPrs?.nodes ?? [];
  if (nodes.length === 0) return 0;
  let counted = 0;
  for (const pr of nodes) {
    const at = pr.mergedAt || pr.updatedAt;
    if (daysBetween(at, now) <= 30) counted += 1;
  }
  // If the 20th PR is still within 30 days we only have a lower bound; that's fine.
  return counted;
}

function toRepo(gql: GraphqlRepo, now: Date): Repo | null {
  const issues = collectIssues(gql);
  const [owner, name] = gql.nameWithOwner.split("/");
  const license = gql.licenseInfo?.spdxId || gql.licenseInfo?.name || null;
  const hasLicense = Boolean(gql.licenseInfo);
  const topics = gql.repositoryTopics.nodes.map((n) => n.topic.name);
  const description = (gql.description ?? "").trim();
  const famousHard = gql.stargazerCount > BOARD_LIMITS.maxStarsDefault;
  const passed = passesHardFilters(
    {
      isPrivate: gql.isPrivate,
      isArchived: gql.isArchived,
      isDisabled: gql.isDisabled,
      isFork: gql.isFork,
      hasLicense,
      pushedAt: gql.pushedAt,
      stars: gql.stargazerCount,
      description,
      hasDefaultBranch: Boolean(gql.defaultBranchRef),
      contributorIssueCount: issues.length,
      allowFamousHard: famousHard,
    },
    now,
  );
  if (!passed || !gql.databaseId || !gql.pushedAt) return null;

  const classified = classifyRepo({
    topics,
    language: gql.primaryLanguage?.name ?? null,
    description,
    name: gql.name,
  });
  const scored = scoreRepo(
    {
      stars: gql.stargazerCount,
      pushedAt: gql.pushedAt,
      mergedLast30d: mergedPrsLast30(gql, now),
      openPrs: gql.openPrs?.totalCount ?? null,
      hasContributing: Boolean(gql.contributing || gql.contributingGh),
      hasCodeOfConduct: Boolean(gql.coc || gql.cocGh),
      issues,
      hasLicense,
      topics,
      hasReadme: Boolean(gql.readme && gql.readme.byteSize > 200),
      description,
      forks: gql.forkCount,
      watchers: gql.watchers.totalCount,
    },
    now,
  );

  return {
    id: gql.databaseId,
    owner,
    name,
    fullName: gql.nameWithOwner,
    url: gql.url,
    homepage: gql.homepageUrl || null,
    description,
    language: gql.primaryLanguage?.name ?? null,
    license,
    topics,
    categories: classified.categories,
    primaryCategory: classified.primaryCategory,
    stars: gql.stargazerCount,
    forks: gql.forkCount,
    openIssues: gql.issues.totalCount,
    pushedAt: gql.pushedAt,
    createdAt: gql.createdAt,
    updatedAt: gql.updatedAt,
    hasContributing: Boolean(gql.contributing || gql.contributingGh),
    hasCodeOfConduct: Boolean(gql.coc || gql.cocGh),
    contributeScore: scored.contributeScore,
    scoreBreakdown: scored.scoreBreakdown,
    why: scored.why,
    riskFlags: scored.riskFlags,
    signalConfidence: scored.signalConfidence,
    famousHard,
    issues: issues.slice(0, BOARD_LIMITS.maxIssuesPerRepo),
  };
}

function buildSearchQueries(now: Date): { category: CategorySlug; query: string; famous: boolean }[] {
  const since = isoDaysAgo(BOARD_LIMITS.maxPushAgeDays);
  const common = `stars:${BOARD_LIMITS.minStars}..${BOARD_LIMITS.maxStarsDefault} pushed:>=${since} archived:false fork:false`;
  const famousCommon = `stars:>${BOARD_LIMITS.maxStarsDefault} pushed:>=${since} archived:false fork:false`;
  const buckets = new Map<CategorySlug, { category: CategorySlug; query: string; famous: boolean }[]>();

  for (const cat of CATEGORY_DEFS) {
    if (cat.slug === "other") continue;
    const shards = searchShardsForCategory(cat.slug).slice(0, 4);
    const list = shards.map((shard, i) => {
      const issueQual = i % 2 === 0 ? "good-first-issues:>0" : "help-wanted-issues:>0";
      return {
        category: cat.slug,
        query: `${shard} ${common} ${issueQual}`,
        famous: false,
      };
    });
    buckets.set(cat.slug, list);
  }

  const famousShards = [
    "topic:machine-learning",
    "topic:react",
    "topic:kubernetes",
    "language:Rust topic:cli",
    "topic:android",
  ];
  const out: { category: CategorySlug; query: string; famous: boolean }[] = famousShards.map((shard) => ({
    category: "other" as CategorySlug,
    query: `${shard} ${famousCommon} good-first-issues:>0`,
    famous: true,
  }));

  // Round-robin shards so later categories are not starved by the candidate cap.
  const maxLen = Math.max(0, ...[...buckets.values()].map((list) => list.length));
  for (let i = 0; i < maxLen; i++) {
    for (const cat of CATEGORY_DEFS) {
      const item = buckets.get(cat.slug)?.[i];
      if (item) out.push(item);
    }
  }

  void now;
  return out;
}

function writeOutputs(data: LatestData) {
  mkdirSync(DATA_DIR, { recursive: true });

  const counts = new Map<CategorySlug, number>();
  for (const cat of CATEGORY_DEFS) counts.set(cat.slug, 0);
  for (const repo of data.repos) {
    for (const slug of repo.categories) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  const categories: CategoriesFile = {
    generatedAt: data.generatedAt,
    categories: CATEGORY_DEFS.map((c) => ({
      slug: c.slug,
      name: c.name,
      count: counts.get(c.slug) ?? 0,
    })),
  };

  const meta: MetaFile = {
    generatedAt: data.generatedAt,
    nextUpdateHint: "02:00 and 14:00 UTC",
    source: data.source,
    repoCount: data.repoCount,
    issueCount: data.issueCount,
    filters: {
      minStars: BOARD_LIMITS.minStars,
      maxStarsDefault: BOARD_LIMITS.maxStarsDefault,
      maxPushAgeDays: BOARD_LIMITS.maxPushAgeDays,
      requireLicense: true,
      requireDescription: true,
      excludeForks: true,
      excludeArchived: true,
      contributorLabels: [...CONTRIBUTOR_LABELS],
    },
    scoring: {
      weights: { ...SCORE_WEIGHTS },
      maxRepos: BOARD_LIMITS.maxRepos,
      maxReposPerCategory: BOARD_LIMITS.maxReposPerCategory,
      maxIssuesPerRepo: BOARD_LIMITS.maxIssuesPerRepo,
    },
  };

  const latestPath = resolve(DATA_DIR, "latest.json");
  const tmp = `${latestPath}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  try {
    renameSync(tmp, latestPath);
  } catch {
    writeFileSync(latestPath, readFileSync(tmp));
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
  writeFileSync(resolve(DATA_DIR, "categories.json"), JSON.stringify(categories, null, 2) + "\n");
  writeFileSync(resolve(DATA_DIR, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
}

function validateBoard(data: LatestData, now: Date) {
  if (!Array.isArray(data.repos)) throw new Error("latest.json missing repos[]");
  if (data.repos.length > BOARD_LIMITS.maxRepos) {
    throw new Error(`repo cap exceeded: ${data.repos.length}`);
  }
  for (const repo of data.repos) {
    if (!repo.fullName || !repo.url) throw new Error("repo missing identity");
    if (!repo.description?.trim()) throw new Error(`${repo.fullName} empty description`);
    if (daysBetween(repo.pushedAt, now) > BOARD_LIMITS.maxPushAgeDays) {
      throw new Error(`${repo.fullName} pushed more than 45 days ago`);
    }
    if (!repo.issues?.length) throw new Error(`${repo.fullName} has no starter issues`);
    if (repo.issues.length > BOARD_LIMITS.maxIssuesPerRepo) {
      throw new Error(`${repo.fullName} too many issues stored`);
    }
  }
}

async function main() {
  loadDotEnv();
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GH_TOKEN is required. Copy .env.example to .env.local and set GH_TOKEN.");
    process.exit(1);
  }

  const started = Date.now();
  const deadline = started + JOB_BUDGET_MS;
  const now = new Date();
  const client = new GithubClient(token);
  const queries = buildSearchQueries(now);

  console.log(`[pulse] starting ${queries.length} search shards`);

  const candidates = new Map<string, SearchRepoHit>();
  const perSearchCategory = new Map<CategorySlug, number>();
  let famousCount = 0;

  for (const q of queries) {
    if (Date.now() > deadline) {
      console.warn("[pulse] time budget hit during search; continuing with current candidates");
      break;
    }
    if (candidates.size >= MAX_CANDIDATES) break;
    if (!q.famous && (perSearchCategory.get(q.category) ?? 0) >= MAX_PER_SEARCH_CATEGORY) continue;
    try {
      const hits = await client.searchRepositories(q.query, q.famous ? 10 : SEARCH_PER_PAGE);
      for (const hit of hits) {
        if (hit.isFork || hit.isArchived) continue;
        if (q.famous) {
          if (famousCount >= MAX_FAMOUS) continue;
          famousCount += 1;
        } else if ((perSearchCategory.get(q.category) ?? 0) >= MAX_PER_SEARCH_CATEGORY) {
          break;
        }
        const key = uniqueKey(hit.owner, hit.name);
        if (!candidates.has(key)) {
          candidates.set(key, hit);
          if (!q.famous) {
            perSearchCategory.set(q.category, (perSearchCategory.get(q.category) ?? 0) + 1);
          }
        }
      }
      console.log(
        `[pulse] search ok category=${q.category} famous=${q.famous} hits=${hits.length} unique=${candidates.size} calls=${client.apiCalls}`,
      );
    } catch (err) {
      console.warn(`[pulse] search failed (${q.category}): ${err instanceof Error ? err.message : err}`);
    }
  }

  const list = [...candidates.values()];
  console.log(`[pulse] enriching ${list.length} unique candidates via GraphQL`);

  const scored: Repo[] = [];
  for (let i = 0; i < list.length; i += BATCH_SIZE) {
    if (Date.now() > deadline) {
      console.warn("[pulse] time budget hit during graphql; scoring what we have");
      break;
    }
    const slice = list.slice(i, i + BATCH_SIZE).map((c) => ({ owner: c.owner, name: c.name }));
    let details: Awaited<ReturnType<typeof client.fetchRepos>> = [];
    try {
      details = await client.fetchRepos(slice);
    } catch (err) {
      console.warn(`[pulse] graphql batch failed, retrying one-by-one: ${err instanceof Error ? err.message : err}`);
      for (const repo of slice) {
        try {
          const [one] = await client.fetchRepos([repo]);
          details.push(one);
        } catch (inner) {
          console.warn(
            `[pulse] skip ${repo.owner}/${repo.name}: ${inner instanceof Error ? inner.message : inner}`,
          );
          details.push(null);
        }
      }
    }
    for (const gql of details) {
      if (!gql) continue;
      try {
        const repo = toRepo(gql, now);
        if (repo) scored.push(repo);
      } catch (err) {
        console.warn(`[pulse] skip ${gql.nameWithOwner}: ${err instanceof Error ? err.message : err}`);
      }
    }
    if (i % 20 === 0) {
      console.log(`[pulse] enriched ${Math.min(i + BATCH_SIZE, list.length)}/${list.length} passed=${scored.length}`);
    }
  }

  const capped = capBoard(scored);
  const issueCount = capped.reduce((n, r) => n + r.issues.length, 0);
  const data: LatestData = {
    generatedAt: new Date().toISOString(),
    source: "github-actions",
    repoCount: capped.length,
    issueCount,
    categories: CATEGORY_DEFS.map((c) => c.slug),
    repos: capped,
  };

  try {
    validateBoard(data, now);
  } catch (err) {
    console.error(`[pulse] validation failed, keeping previous JSON: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  if (capped.length === 0) {
    console.error("[pulse] zero repos passed filters; keeping previous JSON");
    process.exit(1);
  }

  const catsWithRepos = new Set(capped.flatMap((r) => r.categories));
  console.log(
    `[pulse] writing ${capped.length} repos across ${catsWithRepos.size} categories; issues=${issueCount}; apiCalls=${client.apiCalls}; elapsed=${Math.round((Date.now() - started) / 1000)}s`,
  );

  writeOutputs(data);
  console.log("[pulse] done");
}

main().catch((err) => {
  console.error("[pulse] fatal:", err);
  process.exit(1);
});
