import "./test/env";

import { ROUTES, WARMER_HEADER } from "@potluck/contract/routes";
import { uuidSchema } from "@potluck/contract/schema";
import type { Context } from "aws-lambda";
import { afterAll, afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { route } from "./lib/route";
import { apiEvent } from "./test/events";
import { handler } from "./warmer";

const realFetch = globalThis.fetch;
const fetchMock = mock((..._args: Parameters<typeof fetch>) =>
  Promise.resolve(new Response("warm")),
);
globalThis.fetch = fetchMock as unknown as typeof fetch;

const invoke = () => handler(undefined, {} as Context, () => {}) as Promise<unknown>;

beforeEach(() => {
  process.env.API_URL = "https://api.test";
  fetchMock.mockClear();
});

afterEach(() => {
  delete process.env.API_URL;
});

afterAll(() => {
  globalThis.fetch = realFetch;
});

describe("warmer", () => {
  test("pings every route in the manifest with the warmer header", async () => {
    const result = await invoke();

    expect(result).toEqual({ statusCode: 200, body: "Endpoints warmed" });
    expect(fetchMock).toHaveBeenCalledTimes(Object.keys(ROUTES).length);

    const pinged = fetchMock.mock.calls.map(([url, init]) => ({
      url: String(url),
      method: init?.method,
      warmer: ((init?.headers ?? {}) as Record<string, string>)[WARMER_HEADER],
    }));
    for (const { method, template } of Object.values(ROUTES)) {
      const expected = `https://api.test${template.replace(/\{\w+\}/g, "_")}`;
      expect(pinged).toContainEqual({ url: expected, method, warmer: "true" });
    }
  });

  test("the route chassis short-circuits the warmer's pings before validation", async () => {
    await invoke();

    const [, init] = fetchMock.mock.calls[0];
    // API Gateway lowercases header names before handlers see them.
    const headers = Object.fromEntries(
      Object.entries((init?.headers ?? {}) as Record<string, string>).map(([name, value]) => [
        name.toLowerCase(),
        value,
      ]),
    );

    const probeRoute = route({
      params: { potluckId: uuidSchema },
      errorMessage: "Probe failed.",
      handle: async () => {
        throw new Error("the warmer ping must not reach the handler");
      },
    });

    const result = await probeRoute(apiEvent({ headers }));
    expect(result).toEqual({ statusCode: 200, body: "warm" });
  });

  test("fails loudly when API_URL is not configured", async () => {
    delete process.env.API_URL;

    const result = await invoke();

    expect(result).toEqual({ statusCode: 500, body: "API_URL not configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
