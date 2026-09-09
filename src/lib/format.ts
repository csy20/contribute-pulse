export function formatStars(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

export function relativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "unknown";
  const diff = now - then;
  const mins = Math.round(diff / 60_000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 45) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (Math.abs(months) < 18) return `${months}mo ago`;
  const years = Math.round(days / 365);
  return `${years}y ago`;
}

export function formatScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Daily crawl hour (UTC), matches `.github/workflows/update-data.yml`. */
export const CRAWL_HOUR_UTC = 2;

export function nextCrawlDate(now = Date.now()): Date {
  const d = new Date(now);
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), CRAWL_HOUR_UTC, 0, 0, 0));
  if (next.getTime() <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export function formatDurationUntil(target: Date, now = Date.now()): string {
  const ms = target.getTime() - now;
  if (ms <= 60_000) return "soon";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `in ${hours}h`;
  return `in ${Math.round(hours / 24)}d`;
}

export function nextCrawlLabel(now = Date.now()): string {
  return `Next crawl ${formatDurationUntil(nextCrawlDate(now), now)}`;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
