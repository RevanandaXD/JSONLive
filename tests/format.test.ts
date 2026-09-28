import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatBytes, slugify, timeAgo } from "../src/lib/format.ts";

describe("formatBytes", () => {
  it("renders raw bytes below 1 KB", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(512), "512 B");
  });

  it("renders kilobytes with one decimal", () => {
    assert.equal(formatBytes(1024), "1.0 KB");
    assert.equal(formatBytes(1536), "1.5 KB");
  });

  it("renders megabytes with one decimal", () => {
    assert.equal(formatBytes(1024 * 1024), "1.0 MB");
    assert.equal(formatBytes(2.5 * 1024 * 1024), "2.5 MB");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-01-15T12:00:00.000Z");

  it("reports just now under a minute", () => {
    assert.equal(timeAgo(new Date("2026-01-15T11:59:30.000Z"), now), "just now");
  });

  it("reports minutes under an hour", () => {
    assert.equal(timeAgo(new Date("2026-01-15T11:30:00.000Z"), now), "30 min ago");
  });

  it("reports hours under a day", () => {
    assert.equal(timeAgo(new Date("2026-01-15T06:00:00.000Z"), now), "6 hr ago");
  });

  it("uses singular day for exactly one day", () => {
    assert.equal(timeAgo(new Date("2026-01-14T12:00:00.000Z"), now), "1 day ago");
  });

  it("uses plural days for multiple days", () => {
    assert.equal(timeAgo(new Date("2026-01-12T12:00:00.000Z"), now), "3 days ago");
  });

  it("falls back to a date after 30 days", () => {
    const old = new Date("2025-06-01T12:00:00.000Z");
    assert.equal(timeAgo(old, now), old.toLocaleDateString());
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates names", () => {
    assert.equal(slugify("My Users"), "my-users");
    assert.equal(slugify("Products List"), "products-list");
  });

  it("trims leading and trailing separators", () => {
    assert.equal(slugify("  users  "), "users");
    assert.equal(slugify("--users--"), "users");
  });

  it("collapses repeated and unsupported characters", () => {
    assert.equal(slugify("user   data!!! 2024"), "user-data-2024");
    assert.equal(slugify("users.json"), "users-json");
  });

  it("returns an empty string for names without usable characters", () => {
    assert.equal(slugify("!!!"), "");
    assert.equal(slugify(""), "");
  });
});
