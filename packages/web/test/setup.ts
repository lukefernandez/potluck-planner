import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mock } from "bun:test";
import { createElement, type ReactNode } from "react";

if (typeof document === "undefined") {
  GlobalRegistrator.register({ url: "http://localhost:3000" });
}

// Lets React's act() know it is running in a test environment.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

export const routerPush = mock((_href: string) => {});
export const routerRefresh = mock(() => {});
export const TEST_SLUG = "0f1e2d3c-4b5a-6978-8695-a4b3c2d1e0f9";

// The real notFound() throws a Next-internal error; the stub throws this
// sentinel so tests can assert the page bailed out through it.
export const notFoundError = new Error("NEXT_NOT_FOUND");

mock.module("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
  useParams: () => ({ slug: TEST_SLUG }),
  usePathname: () => `/potluck/${TEST_SLUG}`,
  notFound: () => {
    throw notFoundError;
  },
}));

mock.module("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children?: ReactNode }) =>
    createElement("a", { href, ...props }, children),
}));

type FetchArgs = Parameters<typeof fetch>;

export const fetchMock = mock((..._args: FetchArgs) =>
  Promise.resolve(new Response(JSON.stringify({ success: true, data: {} }))),
);
globalThis.fetch = fetchMock as unknown as typeof fetch;

export const respondWith = (envelope: unknown) => {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(envelope)));
};

export const failNetworkOnce = () => {
  fetchMock.mockRejectedValueOnce(new Error("connection refused"));
};

export const resetTestState = () => {
  routerPush.mockClear();
  routerRefresh.mockClear();
  fetchMock.mockClear();
};

export const lastRequest = (): { url: string; init: RequestInit | undefined } => {
  const call = fetchMock.mock.calls.at(-1);
  if (!call) throw new Error("fetch was not called");
  return { url: String(call[0]), init: call[1] };
};
