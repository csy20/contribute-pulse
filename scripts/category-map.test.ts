import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyRepo } from "./category-map.ts";

describe("classifyRepo", () => {
  it("maps ML topics to ai-ml", () => {
    const r = classifyRepo({
      topics: ["machine-learning", "pytorch", "nlp"],
      language: "Python",
      description: "Training utilities for large language models.",
      name: "llm-kit",
    });
    assert.ok(r.categories.includes("ai-ml"));
    assert.equal(r.primaryCategory, "ai-ml");
    assert.equal(r.confidence, "high");
  });

  it("maps frontend topics to web", () => {
    const r = classifyRepo({
      topics: ["react", "nextjs", "tailwind"],
      language: "TypeScript",
      description: "A frontend starter.",
      name: "ui",
    });
    assert.ok(r.categories.includes("web"));
    assert.equal(r.primaryCategory, "web");
  });

  it("maps android/flutter to mobile", () => {
    const r = classifyRepo({
      topics: ["android", "kotlin"],
      language: "Kotlin",
      description: "Android UI components.",
      name: "compose-kit",
    });
    assert.ok(r.categories.includes("mobile"));
  });

  it("uses language + systems topics for systems", () => {
    const r = classifyRepo({
      topics: ["embedded", "kernel"],
      language: "Rust",
      description: "A small operating system for microcontrollers.",
      name: "mini-os",
    });
    assert.ok(r.categories.includes("systems"));
    assert.equal(r.primaryCategory, "systems");
  });

  it("puts low-confidence guesses in other AND the best guess", () => {
    const r = classifyRepo({
      topics: [],
      language: "Rust",
      description: "misc utilities",
      name: "utils",
    });
    assert.equal(r.confidence, "low");
    assert.ok(r.categories.includes("other"));
    assert.ok(r.categories.includes("systems") || r.primaryCategory === "other");
  });

  it("falls back to other when nothing matches", () => {
    const r = classifyRepo({
      topics: [],
      language: null,
      description: "",
      name: "untitled",
    });
    assert.deepEqual(r.categories, ["other"]);
    assert.equal(r.primaryCategory, "other");
  });
});
