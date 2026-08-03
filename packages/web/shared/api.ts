// API client for the Potluck backend. Request and response shapes come from
// the contract module; this file only knows how to move them over HTTP.

import type { DietaryInfo } from "@potluck/contract/dietary";
import { ROUTES, routePath } from "@potluck/contract/routes";
import { type ApiResponse, ErrorCode, type Item, type Potluck } from "@potluck/contract/schema";

import { API_URL } from "./config";

// The transport seam. `fetch` fills it in the app; tests hand in a stub.
export type Transport = (url: string, init: RequestInit) => Promise<Response>;

const failure = (code: ErrorCode, message: string): ApiResponse<never> => ({
  success: false,
  error: { code, message },
});

export const createApi = ({
  baseUrl,
  transport = (url, init) => fetch(url, init),
}: {
  baseUrl: string;
  transport?: Transport;
}) => {
  const request = async <T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    let response: Response;
    try {
      response = await transport(`${baseUrl}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        cache: "no-store",
      });
    } catch {
      return failure(ErrorCode.NETWORK_ERROR, "Failed to connect to the server. Please try again.");
    }

    try {
      return (await response.json()) as ApiResponse<T>;
    } catch {
      // A non-JSON body means something in front of the API answered (e.g. a
      // gateway error page): a server problem, not a connection problem.
      return failure(
        ErrorCode.INTERNAL_ERROR,
        `The server had a problem (status ${response.status}). Please try again.`,
      );
    }
  };

  return {
    createPotluck: ({ name }: { name: string }): Promise<ApiResponse<Potluck>> =>
      request<Potluck>(routePath("createPotluck"), {
        method: ROUTES.createPotluck.method,
        body: JSON.stringify({ name }),
      }),

    getPotluck: ({
      slug,
    }: {
      slug: string;
    }): Promise<ApiResponse<{ potluck: Potluck; items: Item[] }>> =>
      request<{ potluck: Potluck; items: Item[] }>(routePath("getPotluck", { potluckId: slug }), {
        method: ROUTES.getPotluck.method,
      }),

    createItem: ({
      slug,
      name,
      person,
      dietary,
    }: {
      slug: string;
      name: string;
      person: string;
      dietary: DietaryInfo;
    }): Promise<ApiResponse<Item>> =>
      request<Item>(routePath("createItem", { potluckId: slug }), {
        method: ROUTES.createItem.method,
        body: JSON.stringify({ name, person, ...dietary }),
      }),

    deleteItem: ({
      slug,
      itemId,
    }: {
      slug: string;
      itemId: string;
    }): Promise<ApiResponse<{ message: string }>> =>
      request<{ message: string }>(routePath("deleteItem", { potluckId: slug, itemId }), {
        method: ROUTES.deleteItem.method,
      }),
  };
};

export const api = createApi({ baseUrl: API_URL });
