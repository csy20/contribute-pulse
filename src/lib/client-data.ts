import type { LatestData } from "../../scripts/types.ts";
import { isStale, nextCrawlLabel } from "./format.ts";
import { dataUrl } from "./render-card.ts";

let cache: LatestData | null = null;
let inflight: Promise<LatestData | null> | null = null;

export async function loadLatest(): Promise<LatestData | null> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch(dataUrl())
      .then(async (res) => {
        if (!res.ok) throw new Error(`latest.json ${res.status}`);
        const json = (await res.json()) as LatestData;
        if (!Array.isArray(json.repos)) throw new Error("invalid latest.json");
        cache = json;
        return json;
      })
      .catch(() => {
        inflight = null;
        return null;
      });
  }
  return inflight;
}

export function hydrateRelativeTimes(root: ParentNode = document): void {
  const now = Date.now();
  root.querySelectorAll<HTMLElement>("[data-stale-banner]").forEach((el) => {
    const generatedAt = el.getAttribute("data-generated-at") ?? "";
    const sample = el.getAttribute("data-source") === "sample";
    const stale = isStale(generatedAt, now);
    el.hidden = !sample && !stale;
    const sampleCopy = el.querySelector<HTMLElement>("[data-stale-sample]");
    const oldCopy = el.querySelector<HTMLElement>("[data-stale-old]");
    if (sampleCopy) sampleCopy.hidden = !sample;
    if (oldCopy) oldCopy.hidden = !stale;
  });
  root.querySelectorAll<HTMLElement>("[data-next-crawl]").forEach((el) => {
    el.textContent = nextCrawlLabel(now);
  });
  root.querySelectorAll<HTMLTimeElement>("time[data-relative]").forEach((el) => {
    const iso = el.dateTime || el.getAttribute("datetime");
    if (!iso) return;
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return;
    const diff = now - then;
    const mins = Math.round(diff / 60_000);
    let label = "just now";
    if (Math.abs(mins) >= 1 && Math.abs(mins) < 60) label = `${mins}m ago`;
    else if (Math.abs(mins) >= 60) {
      const hours = Math.round(mins / 60);
      if (Math.abs(hours) < 24) label = `${hours}h ago`;
      else {
        const days = Math.round(hours / 24);
        if (Math.abs(days) < 45) label = `${days}d ago`;
        else {
          const months = Math.round(days / 30);
          label = Math.abs(months) < 18 ? `${months}mo ago` : `${Math.round(days / 365)}y ago`;
        }
      }
    }
    el.textContent = label;
  });
}
