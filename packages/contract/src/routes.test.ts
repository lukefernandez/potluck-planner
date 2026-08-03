import { describe, expect, test } from "bun:test";

import { ROUTES, routePath } from "./routes";

describe("routePath", () => {
  test("returns the template verbatim for param-less routes", () => {
    expect(routePath("createPotluck")).toBe("/potlucks");
  });

  test("interpolates every path param", () => {
    expect(routePath("deleteItem", { potluckId: "p-1", itemId: "i-1" })).toBe(
      "/potlucks/p-1/items/i-1",
    );
  });

  test("URL-encodes param values", () => {
    expect(routePath("getPotluck", { potluckId: "a/b" })).toBe("/potlucks/a%2Fb");
  });

  test("every template interpolates cleanly with placeholder params", () => {
    for (const { template } of Object.values(ROUTES)) {
      expect(template.replace(/\{\w+\}/g, "_")).not.toContain("{");
    }
  });
});
