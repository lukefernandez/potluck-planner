import { describe, expect, test } from "bun:test";

import { DIETARY_FLAGS } from "./dietary";
import { createItemSchema, createPotluckSchema, uuidSchema } from "./schema";

describe("createPotluckSchema", () => {
  test("accepts a name up to 255 characters", () => {
    expect(createPotluckSchema.safeParse({ name: "x".repeat(255) }).success).toBe(true);
  });

  test("rejects an empty name", () => {
    expect(createPotluckSchema.safeParse({ name: "" }).success).toBe(false);
  });

  test("rejects a name over 255 characters", () => {
    expect(createPotluckSchema.safeParse({ name: "x".repeat(256) }).success).toBe(false);
  });
});

describe("createItemSchema", () => {
  test("carries a field for every registered dietary flag, defaulting to false", () => {
    const result = createItemSchema.parse({ name: "Rolls", person: "Ada" });

    for (const flag of DIETARY_FLAGS) {
      expect(result[flag.key]).toBe(false);
    }
    expect(Object.keys(result)).toHaveLength(2 + DIETARY_FLAGS.length);
  });

  test("keeps explicitly-set flags", () => {
    const result = createItemSchema.parse({ name: "Rolls", person: "Ada", containsGluten: true });

    expect(result.containsGluten).toBe(true);
    expect(result.containsMeat).toBe(false);
  });

  test("requires both name and person", () => {
    expect(createItemSchema.safeParse({ name: "Rolls" }).success).toBe(false);
    expect(createItemSchema.safeParse({ person: "Ada" }).success).toBe(false);
  });
});

describe("uuidSchema", () => {
  test("accepts a v4 uuid", () => {
    expect(uuidSchema.safeParse("0f1e2d3c-4b5a-6978-8695-a4b3c2d1e0f9").success).toBe(true);
  });

  test("rejects arbitrary strings", () => {
    expect(uuidSchema.safeParse("potluck-123").success).toBe(false);
  });
});
