import { ROUTES, WARMER_HEADER } from "@potluck/contract/routes";
import type { Handler } from "aws-lambda";

// Any syntactically-valid placeholder works for path params: the route
// chassis short-circuits on the warmer header before validating anything.
const PROBE = "_";

export const handler: Handler = async () => {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return { statusCode: 500, body: "API_URL not configured" };
  }

  await Promise.allSettled(
    Object.values(ROUTES).map(async ({ method, template }) => {
      const url = `${apiUrl}${template.replace(/\{\w+\}/g, PROBE)}`;
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          [WARMER_HEADER]: "true",
        },
      });
    }),
  );

  return { statusCode: 200, body: "Endpoints warmed" };
};
