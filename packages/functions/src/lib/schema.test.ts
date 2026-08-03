import { describe, expect, test } from "bun:test";

import { toItem, type ItemEntity } from "./schema";

describe("toItem", () => {
  test("backfills dietary flags missing from stored entities", () => {
    const legacy: ItemEntity = {
      pk: "POTLUCK#p",
      sk: "ITEM#i",
      id: "i",
      name: "Rolls",
      person: "Ada",
      potluckId: "p",
      createdAt: "2026-07-01T00:00:00.000Z",
      entityType: "ITEM",
    };

    const item = toItem(legacy);

    expect(item.containsMeat).toBe(false);
    expect(item.containsGluten).toBe(false);
  });

  test("keeps flags that are present on the entity", () => {
    const entity: ItemEntity = {
      pk: "POTLUCK#p",
      sk: "ITEM#i",
      id: "i",
      name: "Rolls",
      person: "Ada",
      potluckId: "p",
      createdAt: "2026-07-01T00:00:00.000Z",
      entityType: "ITEM",
      containsGluten: true,
    };

    expect(toItem(entity).containsGluten).toBe(true);
  });
});
