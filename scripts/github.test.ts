import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_BACKOFF_MS, rateLimitWaitMs } from "./github.ts";

describe("rateLimitWaitMs", () => {
  it("prefers Retry-After, capped", () => {
    assert.equal(rateLimitWaitMs({ attempt: 0, retryAfterSec: 5, remaining: "10", resetEpochSec: 0 }), 5_000);
    assert.equal(
      rateLimitWaitMs({ attempt: 0, retryAfterSec: 120, remaining: "10", resetEpochSec: 0 }),
      MAX_BACKOFF_MS,
    );
  });

  it("does not sleep until hourly reset on a secondary-limit 403", () => {
    const now = Date.parse("2026-09-12T12:00:00Z");
    const reset = Math.floor(now / 1000) + 3600;
    const wait = rateLimitWaitMs({
      attempt: 2,
      retryAfterSec: 0,
      remaining: "12",
      resetEpochSec: reset,
      now,
    });
    assert.equal(wait, 4_000);
    assert.ok(wait <= MAX_BACKOFF_MS);
  });

  it("caps primary-limit waits at MAX_BACKOFF_MS", () => {
    const now = Date.parse("2026-09-12T12:00:00Z");
    const reset = Math.floor(now / 1000) + 3600;
    const wait = rateLimitWaitMs({
      attempt: 0,
      retryAfterSec: 0,
      remaining: "0",
      resetEpochSec: reset,
      now,
    });
    assert.equal(wait, MAX_BACKOFF_MS);
  });
});
