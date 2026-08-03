import { TEST_SLUG, notFoundError, resetTestState, respondWith } from "../../../test/setup";

import { DIETARY_FLAGS, type DietaryInfo } from "@potluck/contract/dietary";
import type { Item } from "@potluck/contract/schema";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import PotluckPage, { generateMetadata } from "./page";

const params = Promise.resolve({ slug: TEST_SLUG });

const potluck = {
  id: TEST_SLUG,
  name: "Friendsgiving 2026",
  createdAt: "2026-07-01T00:00:00.000Z",
};

let nextItemId = 0;
const item = (overrides: Partial<Item> = {}): Item => ({
  id: `11111111-1111-4111-8111-${String(++nextItemId).padStart(12, "0")}`,
  name: "Mac and cheese",
  person: "Sam",
  potluckId: TEST_SLUG,
  createdAt: "2026-07-02T00:00:00.000Z",
  ...(Object.fromEntries(DIETARY_FLAGS.map((flag) => [flag.key, false])) as DietaryInfo),
  ...overrides,
});

const respondWithPotluck = (items: Item[]) => {
  respondWith({ success: true, data: { potluck, items } });
};

// A slug the API rejects as malformed and one it reports missing both mean
// "no such potluck" to someone following a bad link.
type MissingCode = "NOT_FOUND" | "VALIDATION_ERROR";
const MISSING_CODES: MissingCode[] = ["NOT_FOUND", "VALIDATION_ERROR"];
const missingEnvelope = (code: MissingCode) => ({
  success: false,
  error: { code, message: "Potluck not found" },
});

beforeEach(resetTestState);
afterEach(cleanup);

describe("generateMetadata", () => {
  test("titles the link preview after the potluck and keeps it out of search indexes", async () => {
    respondWithPotluck([item()]);

    const metadata = await generateMetadata({ params });

    expect(metadata.title).toBe("Friendsgiving 2026");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph?.title).toBe("Friendsgiving 2026");
  });

  test("invites the first dish when the potluck is empty", async () => {
    respondWithPotluck([]);

    const metadata = await generateMetadata({ params });

    expect(metadata.description).toContain("Be the first to add a dish");
  });

  test("counts the dishes signed up, singular and plural", async () => {
    respondWithPotluck([item()]);
    expect((await generateMetadata({ params })).description).toContain("1 dish is signed up");

    respondWithPotluck([item(), item()]);
    expect((await generateMetadata({ params })).description).toContain("2 dishes are signed up");
  });

  test.each(MISSING_CODES)("falls back to a not-found preview on %s", async (code) => {
    respondWith(missingEnvelope(code));

    const metadata = await generateMetadata({ params });

    expect(metadata.title).toBe("Potluck not found");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  test("rethrows non-notFound API errors", async () => {
    respondWith({ success: false, error: { code: "INTERNAL_ERROR", message: "boom" } });

    expect(generateMetadata({ params })).rejects.toThrow("boom");
  });
});

describe("Potluck page", () => {
  test("renders the potluck with its dishes, dietary badges, and delete controls", async () => {
    respondWithPotluck([
      item({ name: "Mac and cheese", person: "Sam", containsDairy: true, containsGluten: true }),
      item({ name: "Fruit salad", person: "Ada" }),
    ]);

    render(await PotluckPage({ params }));

    screen.getByRole("heading", { name: "Friendsgiving 2026" });
    screen.getByText("2 dishes");
    screen.getByText("Mac and cheese");
    screen.getByText("Sam");
    screen.getByText("Fruit salad");
    // Dairy + gluten → vegetarian; nothing flagged → vegan.
    screen.getByText("Vegetarian");
    screen.getByText("Vegan");
    expect(screen.getAllByRole("button", { name: "Delete item" })).toHaveLength(2);
  });

  test("shows the empty table when no dishes are signed up", async () => {
    respondWithPotluck([]);

    render(await PotluckPage({ params }));

    screen.getByText("The table's empty");
    screen.getByText("0 dishes");
  });

  test.each(MISSING_CODES)("bails out through notFound() on %s", async (code) => {
    respondWith(missingEnvelope(code));

    expect(PotluckPage({ params })).rejects.toBe(notFoundError);
  });

  test("throws other API errors to the error boundary", async () => {
    respondWith({ success: false, error: { code: "INTERNAL_ERROR", message: "boom" } });

    expect(PotluckPage({ params })).rejects.toThrow("boom");
  });
});
