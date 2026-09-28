import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SETTINGS_LAYOUT,
  columnsOf,
  deleteAccountRequest,
  describeKeyUsage,
  displayValue,
  isEmailConfirmed,
  readDeleteAccountError,
  spanOf,
} from "../src/lib/settings.ts";

describe("settings layout", () => {
  it("keeps every span inside the grid", () => {
    const columns = columnsOf(SETTINGS_LAYOUT.columns);

    for (const key of ["profile", "apiKeys", "danger"] as const) {
      const span = spanOf(SETTINGS_LAYOUT[key]);
      assert.ok(span >= 1 && span <= columns, `${key} span ${span} exceeds ${columns}`);
    }
  });

  it("aligns profile and api keys on the same row", () => {
    const columns = columnsOf(SETTINGS_LAYOUT.columns);
    const row =
      spanOf(SETTINGS_LAYOUT.profile) + spanOf(SETTINGS_LAYOUT.apiKeys);

    assert.equal(row, columns);
  });

  it("stretches the danger zone across the full row", () => {
    assert.equal(
      spanOf(SETTINGS_LAYOUT.danger),
      columnsOf(SETTINGS_LAYOUT.columns),
    );
  });
});

describe("displayValue", () => {
  it("falls back to a dash for missing values", () => {
    assert.equal(displayValue(undefined), "-");
    assert.equal(displayValue(null), "-");
    assert.equal(displayValue(""), "-");
    assert.equal(displayValue("   "), "-");
  });

  it("trims real values", () => {
    assert.equal(displayValue("  Revan  "), "Revan");
  });
});

describe("isEmailConfirmed", () => {
  it("accepts the email regardless of case and padding", () => {
    assert.equal(isEmailConfirmed("user@example.com", "user@example.com"), true);
    assert.equal(isEmailConfirmed("  USER@Example.com ", "user@example.com"), true);
  });

  it("rejects anything that is not an exact match", () => {
    assert.equal(isEmailConfirmed("", "user@example.com"), false);
    assert.equal(isEmailConfirmed("   ", "user@example.com"), false);
    assert.equal(isEmailConfirmed("user@example.co", "user@example.com"), false);
    assert.equal(isEmailConfirmed("other@example.com", "user@example.com"), false);
  });
});

describe("deleteAccountRequest", () => {
  it("sends a trimmed email as JSON", () => {
    const request = deleteAccountRequest("  user@example.com  ");

    assert.equal(request.method, "DELETE");
    assert.equal(request.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(request.body), { email: "user@example.com" });
  });
});

describe("readDeleteAccountError", () => {
  it("uses the server message when present", () => {
    assert.equal(
      readDeleteAccountError({ error: "Email not found" }, "fallback"),
      "Email not found",
    );
  });

  it("falls back for missing, empty, or non-string errors", () => {
    assert.equal(readDeleteAccountError(null, "fallback"), "fallback");
    assert.equal(readDeleteAccountError({}, "fallback"), "fallback");
    assert.equal(readDeleteAccountError({ error: "  " }, "fallback"), "fallback");
    assert.equal(readDeleteAccountError({ error: 500 }, "fallback"), "fallback");
  });
});

describe("describeKeyUsage", () => {
  it("reports keys that were never used", () => {
    assert.equal(describeKeyUsage({}), "Never used");
    assert.equal(
      describeKeyUsage({ lastUsedAt: null, expiresAt: null }),
      "Never used",
    );
  });

  it("includes the last used and expiry timestamps", () => {
    const summary = describeKeyUsage({
      lastUsedAt: "2026-01-15T10:30:00.000Z",
      expiresAt: "2026-02-15T10:30:00.000Z",
    });

    assert.match(summary, /^Last used .+ · Expires .+$/);
  });

  it("shows the expiry even when the key was never used", () => {
    const summary = describeKeyUsage({ expiresAt: "2026-02-15T10:30:00.000Z" });

    assert.match(summary, /^Never used · Expires .+$/);
  });
});
