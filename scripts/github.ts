import { graphql } from "@octokit/graphql";

const SEARCH_INTERVAL_MS = 2_200; // stay under ~30 search req/min
const GRAPHQL_INTERVAL_MS = 350;
export const MAX_BACKOFF_MS = 40_000;

export interface SearchRepoHit {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  pushedAt: string;
  createdAt: string;
  updatedAt: string;
  isFork: boolean;
  isArchived: boolean;
  url: string;
}

export interface GraphqlIssue {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  comments: { totalCount: number };
  assignees: { totalCount: number };
  labels: { nodes: { name: string }[] };
}

export interface GraphqlRepo {
  databaseId: number | null;
  name: string;
  nameWithOwner: string;
  url: string;
  homepageUrl: string | null;
  description: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  isDisabled: boolean;
  isFork: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  forkCount: number;
  stargazerCount: number;
  issues: { totalCount: number };
  watchers: { totalCount: number };
  primaryLanguage: { name: string } | null;
  licenseInfo: { spdxId: string | null; name: string; key: string } | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] };
  defaultBranchRef: { name: string } | null;
  contributing: { byteSize: number } | null;
  contributingGh: { byteSize: number } | null;
  coc: { byteSize: number } | null;
  cocGh: { byteSize: number } | null;
  readme: { byteSize: number } | null;
  openPrs: { totalCount: number };
  mergedPrs: { nodes: { mergedAt: string | null; updatedAt: string }[] };
  recentIssues: { nodes: GraphqlIssue[] };
  goodFirstIssues: { nodes: GraphqlIssue[] };
  helpWantedIssues: { nodes: GraphqlIssue[] };
}

const REPO_FIELDS = `
  databaseId
  name
  nameWithOwner
  url
  homepageUrl
  description
  isPrivate
  isArchived
  isDisabled
  isFork
  createdAt
  updatedAt
  pushedAt
  forkCount
  stargazerCount
  issues(states: OPEN) { totalCount }
  watchers { totalCount }
  primaryLanguage { name }
  licenseInfo { spdxId name key }
  repositoryTopics(first: 20) { nodes { topic { name } } }
  defaultBranchRef { name }
  contributing: object(expression: "HEAD:CONTRIBUTING.md") { ... on Blob { byteSize } }
  contributingGh: object(expression: "HEAD:.github/CONTRIBUTING.md") { ... on Blob { byteSize } }
  coc: object(expression: "HEAD:CODE_OF_CONDUCT.md") { ... on Blob { byteSize } }
  cocGh: object(expression: "HEAD:.github/CODE_OF_CONDUCT.md") { ... on Blob { byteSize } }
  readme: object(expression: "HEAD:README.md") { ... on Blob { byteSize } }
  openPrs: pullRequests(states: OPEN) { totalCount }
  mergedPrs: pullRequests(states: MERGED, first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
    nodes { mergedAt updatedAt }
  }
  recentIssues: issues(states: OPEN, first: 30, orderBy: {field: UPDATED_AT, direction: DESC}) {
    nodes {
      number title url createdAt updatedAt
      comments { totalCount }
      assignees(first: 1) { totalCount }
      labels(first: 12) { nodes { name } }
    }
  }
  goodFirstIssues: issues(states: OPEN, labels: ["good first issue"], first: 8, orderBy: {field: UPDATED_AT, direction: DESC}) {
    nodes {
      number title url createdAt updatedAt
      comments { totalCount }
      assignees(first: 1) { totalCount }
      labels(first: 12) { nodes { name } }
    }
  }
  helpWantedIssues: issues(states: OPEN, labels: ["help wanted"], first: 8, orderBy: {field: UPDATED_AT, direction: DESC}) {
    nodes {
      number title url createdAt updatedAt
      comments { totalCount }
      assignees(first: 1) { totalCount }
      labels(first: 12) { nodes { name } }
    }
  }
`;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRateLimit(status: number, body: string, remaining: string | null): boolean {
  if (status === 429) return true;
  if (remaining === "0") return true;
  return status === 403 && /rate limit|secondary rate/i.test(body);
}

/** Cap waits so a secondary-limit 403 cannot sleep until the hourly reset. */
export function rateLimitWaitMs(input: {
  attempt: number;
  retryAfterSec: number;
  remaining: string | null;
  resetEpochSec: number;
  now?: number;
}): number {
  const now = input.now ?? Date.now();
  if (input.retryAfterSec > 0) return Math.min(input.retryAfterSec * 1000, MAX_BACKOFF_MS);
  if (input.remaining === "0" && input.resetEpochSec > 0) {
    return Math.min(Math.max(input.resetEpochSec * 1000 - now, 1500), MAX_BACKOFF_MS);
  }
  return Math.min(1000 * 2 ** input.attempt, MAX_BACKOFF_MS);
}

export class GithubClient {
  apiCalls = 0;
  private token: string;
  private restBase: string;
  private lastSearchAt = 0;
  private lastGraphqlAt = 0;
  private searchChain: Promise<void> = Promise.resolve();
  private graphqlChain: Promise<void> = Promise.resolve();
  private gql: ReturnType<typeof graphql.defaults>;

  constructor(token: string) {
    this.token = token;
    this.restBase = process.env.GITHUB_API_URL || "https://api.github.com";
    const gqlUrl = process.env.GITHUB_GRAPHQL_URL || "https://api.github.com/graphql";
    this.gql = graphql.defaults({
      headers: { authorization: `bearer ${token}` },
      baseUrl: gqlUrl.replace(/\/graphql$/, ""),
    });
  }

  private headers(): Record<string, string> {
    return {
      authorization: `bearer ${this.token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "contribute-pulse-crawler",
    };
  }

  private async throttleSearch(): Promise<void> {
    const wait = Math.max(0, SEARCH_INTERVAL_MS - (Date.now() - this.lastSearchAt));
    if (wait) await sleep(wait);
    this.lastSearchAt = Date.now();
  }

  private async throttleGraphql(): Promise<void> {
    const wait = Math.max(0, GRAPHQL_INTERVAL_MS - (Date.now() - this.lastGraphqlAt));
    if (wait) await sleep(wait);
    this.lastGraphqlAt = Date.now();
  }

  private async fetchWithBackoff(url: string, attempt = 0): Promise<Response> {
    const res = await fetch(url, { headers: this.headers() });
    this.apiCalls += 1;
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (res.status === 403 || res.status === 429) {
      const body = await res.text().catch(() => "");
      if (isRateLimit(res.status, body, remaining)) {
        if (attempt >= 6) {
          throw new Error(`GitHub rate limit after ${attempt} retries: ${res.status} ${body.slice(0, 200)}`);
        }
        const waitMs = rateLimitWaitMs({
          attempt,
          retryAfterSec: Number(res.headers.get("retry-after") || 0),
          remaining,
          resetEpochSec: Number(res.headers.get("x-ratelimit-reset") || 0),
        });
        console.warn(`[pulse] backoff ${waitMs}ms status=${res.status} attempt=${attempt + 1}`);
        await sleep(waitMs + 250);
        return this.fetchWithBackoff(url, attempt + 1);
      }
      throw new Error(`GitHub HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return res;
  }

  async searchRepositories(query: string, perPage = 30): Promise<SearchRepoHit[]> {
    const run = this.searchChain.then(async () => {
      await this.throttleSearch();
      const url =
        `${this.restBase}/search/repositories` +
        `?q=${encodeURIComponent(query)}&per_page=${perPage}&sort=updated&order=desc`;
      const res = await this.fetchWithBackoff(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`search failed ${res.status}: ${text.slice(0, 300)}`);
      }
      const json = (await res.json()) as {
        items?: Array<{
          id: number;
          name: string;
          full_name: string;
          html_url: string;
          description: string | null;
          stargazers_count: number;
          language: string | null;
          topics?: string[];
          pushed_at: string;
          created_at: string;
          updated_at: string;
          fork: boolean;
          archived: boolean;
          owner: { login: string };
        }>;
      };
      return (json.items ?? []).map((item) => ({
        id: item.id,
        owner: item.owner.login,
        name: item.name,
        fullName: item.full_name,
        description: item.description,
        stars: item.stargazers_count,
        language: item.language,
        topics: item.topics ?? [],
        pushedAt: item.pushed_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isFork: item.fork,
        isArchived: item.archived,
        url: item.html_url,
      }));
    });
    this.searchChain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async fetchRepos(repos: { owner: string; name: string }[]): Promise<(GraphqlRepo | null)[]> {
    if (repos.length === 0) return [];
    const run = this.graphqlChain.then(async () => {
      await this.throttleGraphql();
      const aliases = repos
        .map(
          (r, i) =>
            `r${i}: repository(owner: $o${i}, name: $n${i}) { ${REPO_FIELDS} }`,
        )
        .join("\n");
      const varDefs = repos
        .map((_, i) => `$o${i}: String!, $n${i}: String!`)
        .join(", ");
      const variables: Record<string, string> = {};
      repos.forEach((r, i) => {
        variables[`o${i}`] = r.owner;
        variables[`n${i}`] = r.name;
      });
      const query = `query Batch(${varDefs}) {\n${aliases}\n}`;

      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          this.apiCalls += 1;
          const data = (await this.gql(query, variables)) as Record<string, GraphqlRepo | null>;
          return repos.map((_, i) => data[`r${i}`] ?? null);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const retryable = /403|429|rate limit|secondary rate|ETIMEDOUT|ECONNRESET|502|503/i.test(
            message,
          );
          if (!retryable || attempt === 5) throw err;
          const waitMs = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
          console.warn(`[pulse] graphql backoff ${waitMs}ms: ${message.slice(0, 180)}`);
          await sleep(waitMs);
        }
      }
      return repos.map(() => null);
    });
    this.graphqlChain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}
