import { describe, expect, mock, test } from "bun:test";

import { ErrorCode } from "@potluck/contract/schema";

import { createApi, type Transport } from "./api";

const jsonTransport =
  (envelope: unknown): Transport =>
  () =>
    Promise.resolve(new Response(JSON.stringify(envelope)));

describe("createApi", () => {
  test("passes the envelope through on success", async () => {
    const potluck = { id: "p-1", name: "Friendsgiving", createdAt: "2026-07-01T00:00:00.000Z" };
    const api = createApi({
      baseUrl: "https://api.test",
      transport: jsonTransport({ success: true, data: potluck }),
    });

    const result = await api.createPotluck({ name: "Friendsgiving" });

    expect(result).toEqual({ success: true, data: potluck });
  });

  test("builds the request from the object params", async () => {
    const transport = mock((_url: string, _init: RequestInit) =>
      Promise.resolve(new Response(JSON.stringify({ success: true, data: {} }))),
    );
    const api = createApi({ baseUrl: "https://api.test", transport });

    await api.deleteItem({ slug: "slug-1", itemId: "item-1" });

    const [url, init] = transport.mock.calls[0];
    expect(url).toBe("https://api.test/potlucks/slug-1/items/item-1");
    expect(init.method).toBe("DELETE");
  });

  test("maps a refused connection to NETWORK_ERROR", async () => {
    const api = createApi({
      baseUrl: "https://api.test",
      transport: () => Promise.reject(new Error("connection refused")),
    });

    const result = await api.getPotluck({ slug: "slug-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.NETWORK_ERROR);
    }
  });

  test("maps a non-JSON gateway response to INTERNAL_ERROR", async () => {
    const api = createApi({
      baseUrl: "https://api.test",
      transport: () => Promise.resolve(new Response("<html>Bad Gateway</html>", { status: 502 })),
    });

    const result = await api.getPotluck({ slug: "slug-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(result.error.message).toContain("502");
    }
  });
});
