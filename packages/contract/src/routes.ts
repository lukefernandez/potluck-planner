// The route manifest: the one place the API's routes are declared. Three
// consumers read it — sst.config.ts builds the API Gateway routes from it,
// the warmer pings every route in it, and the web client interpolates its
// request paths with routePath. Adding a route here reaches all three.

export const ROUTES = {
  createPotluck: { method: "POST", template: "/potlucks" },
  getPotluck: { method: "GET", template: "/potlucks/{potluckId}" },
  createItem: { method: "POST", template: "/potlucks/{potluckId}/items" },
  deleteItem: { method: "DELETE", template: "/potlucks/{potluckId}/items/{itemId}" },
} as const;

export type RouteName = keyof typeof ROUTES;

// The keep-warm handshake: the warmer sends this header, the route chassis
// short-circuits on it. Lowercase, because API Gateway lowercases incoming
// header names before handlers see them.
export const WARMER_HEADER = "x-warmer";

type PathParam<T extends string> = T extends `${string}{${infer P}}${infer Rest}`
  ? P | PathParam<Rest>
  : never;

type RouteParams<N extends RouteName> = PathParam<(typeof ROUTES)[N]["template"]>;

// Interpolates a route's path template; the params a route needs are checked
// at compile time (param-less routes take no second argument).
export const routePath = <N extends RouteName>(
  name: N,
  ...args: [RouteParams<N>] extends [never] ? [] : [params: Record<RouteParams<N>, string>]
): string => {
  const params = (args[0] ?? {}) as Record<string, string>;
  return ROUTES[name].template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing path param "${key}" for route "${name}"`);
    }
    return encodeURIComponent(value);
  });
};
