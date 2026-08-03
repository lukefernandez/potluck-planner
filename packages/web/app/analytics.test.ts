import { describe, expect, test } from "bun:test";

import { redact } from "./analytics";

const SLUG = "3f8c1a2e-9b4d-4c7e-8a1f-2d5e6b7c8d90";

describe("redact", () => {
  test("replaces the slug wherever a potluck url appears", () => {
    expect(redact(`https://potluck.lukefernandez.io/potluck/${SLUG}`)).toBe(
      "https://potluck.lukefernandez.io/potluck/[slug]",
    );
    expect(redact(`/potluck/${SLUG}`)).toBe("/potluck/[slug]");
  });

  test("keeps the query and hash that follow the slug", () => {
    expect(redact(`/potluck/${SLUG}?from=text#dishes`)).toBe("/potluck/[slug]?from=text#dishes");
  });

  test("leaves everything else alone", () => {
    expect(redact("https://potluck.lukefernandez.io/privacy-policy")).toBe(
      "https://potluck.lukefernandez.io/privacy-policy",
    );
    expect(redact(undefined)).toBeUndefined();
    expect(redact(42)).toBe(42);
  });
});
