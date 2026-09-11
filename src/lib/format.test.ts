import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextCrawlDate, nextCrawlLabel } from "./format.ts";

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
