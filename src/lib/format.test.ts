import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStale, nextCrawlDate, nextCrawlLabel, safeHttpUrl } from "./format.ts";

describe("nextCrawlDate", () => {
  it("picks 02:00 UTC when that slot is still ahead", () => {
    const now = Date.parse("2026-09-12T01:00:00Z");
    assert.equal(nextCrawlDate(now).toISOString(), "2026-09-12T02:00:00.000Z");
  });

  it("picks 14:00 UTC after the morning slot", () => {
    const now = Date.parse("2026-09-12T07:30:00Z");
    assert.equal(nextCrawlDate(now).toISOString(), "2026-09-12T14:00:00.000Z");
  });

  it("rolls to the next day's 02:00 UTC after the afternoon slot", () => {
    const now = Date.parse("2026-09-12T14:00:00Z");
    assert.equal(nextCrawlDate(now).toISOString(), "2026-09-13T02:00:00.000Z");
  });
});

describe("nextCrawlLabel", () => {
  it("reports hours until the next slot", () => {
    const now = Date.parse("2026-09-12T08:00:00Z");
    assert.equal(nextCrawlLabel(now), "Next crawl in 6h");
  });
});

describe("isStale", () => {
  it("is fresh inside 36 hours and stale after", () => {
    const generated = "2026-09-10T00:00:00.000Z";
    assert.equal(isStale(generated, Date.parse("2026-09-11T11:00:00Z")), false);
    assert.equal(isStale(generated, Date.parse("2026-09-11T13:00:00Z")), true);
    assert.equal(isStale("not-a-date", Date.parse("2026-09-11T11:00:00Z")), true);
  });
});

describe("safeHttpUrl", () => {
  it("keeps http(s) and drops other schemes", () => {
    assert.equal(safeHttpUrl("https://example.com/x"), "https://example.com/x");
    assert.equal(safeHttpUrl("javascript:alert(1)"), null);
    assert.equal(safeHttpUrl("not a url"), null);
    assert.equal(safeHttpUrl(null), null);
  });
});
