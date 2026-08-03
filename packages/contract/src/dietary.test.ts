import { describe, expect, test } from "bun:test";

import { DIETARY_FLAGS, classify, type DietaryInfo } from "./dietary";

const item = (overrides: Partial<DietaryInfo> = {}): DietaryInfo => ({
  ...(Object.fromEntries(DIETARY_FLAGS.map((flag) => [flag.key, false])) as DietaryInfo),
  ...overrides,
});

const labels = (info: DietaryInfo) => classify(info).map((badge) => badge.label);

describe("classify", () => {
  test("nothing flagged is vegan and free of everything", () => {
    expect(labels(item())).toEqual(["Vegan", "Dairy-free", "Egg-free", "Nut-free", "Gluten-free"]);
  });

  test("dairy or eggs demote vegan to vegetarian", () => {
    expect(labels(item({ containsDairy: true }))).toEqual([
      "Vegetarian",
      "Egg-free",
      "Nut-free",
      "Gluten-free",
    ]);
    expect(labels(item({ containsEggs: true }))).toContain("Vegetarian");
  });

  test("other animal products demote vegan to vegetarian", () => {
    expect(labels(item({ containsOtherAnimalProducts: true }))).toEqual([
      "Vegetarian",
      "Dairy-free",
      "Egg-free",
      "Nut-free",
      "Gluten-free",
    ]);
  });

  test("fish or shellfish demote to pescatarian", () => {
    expect(labels(item({ containsFish: true }))).toContain("Pescatarian");
    expect(labels(item({ containsShellfish: true }))).toContain("Pescatarian");
  });

  test("meat clears every diet badge", () => {
    const badges = classify(item({ containsMeat: true }));
    expect(badges.filter((badge) => badge.kind === "diet")).toHaveLength(0);
  });

  test("free-from badges track their flags independently", () => {
    expect(labels(item({ containsGluten: true, containsNuts: true }))).toEqual([
      "Vegan",
      "Dairy-free",
      "Egg-free",
    ]);
  });

  test("diet badges come before free-from badges", () => {
    const kinds = classify(item({ containsDairy: true })).map((badge) => badge.kind);
    expect(kinds).toEqual(["diet", "free-from", "free-from", "free-from"]);
  });
});
