"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

// A potluck slug is the only credential its page has, so it must not leave
// the browser inside an analytics payload — a captured url would put every
// slug in a third party's database. Swapping the slug for a placeholder
// keeps the route, so potluck visits still get counted.
export const redact = (value: unknown) =>
  typeof value === "string" && value.includes("/potluck/")
    ? value.replace(/\/potluck\/[^/?#\s]+/g, "/potluck/[slug]")
    : value;

const redactAll = (properties: Record<string, unknown> | undefined) => {
  for (const key in properties) {
    properties[key] = redact(properties[key]);
  }
};

// One PostHog project is shared across lukefernandez.io subdomains.
// The project key is publishable by design.
export function Analytics() {
  useEffect(() => {
    posthog.init("phc_TiL3OcCTNhP8FJ73Gw4jXKXSwwzKYJ2RJBFxlpPDkjH", {
      api_host: "https://us.i.posthog.com",
      defaults: "2025-05-24",
      // Every url-shaped property is rewritten rather than a named few, so a
      // property added later cannot quietly start carrying the slug.
      before_send: (event) => {
        if (!event) return null;
        redactAll(event.properties);
        redactAll(event.$set_once);
        return event;
      },
    });
  }, []);

  return null;
}
