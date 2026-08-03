import { WARMER_HEADER } from "@potluck/contract/routes";
import { ErrorCode, type ErrorResponse, type SuccessResponse } from "@potluck/contract/schema";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { z } from "zod";

// The chassis: owns the warmer short-circuit, path-parameter and body
// validation, the response envelope, CORS, and error mapping. Handlers are
// functions from validated input to a RouteResult.

export type RouteResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "created"; data: T }
  | { kind: "notFound"; message: string };

export const ok = <T>(data: T): RouteResult<T> => ({ kind: "ok", data });
export const created = <T>(data: T): RouteResult<T> => ({ kind: "created", data });
export const notFound = (message: string): RouteResult<never> => ({ kind: "notFound", message });

interface RouteConfig<P, B, T> {
  params?: { [K in keyof P]: z.ZodType<P[K]> };
  // Input type is unknown: schemas with defaulted fields accept looser input
  // than they output.
  body?: z.ZodType<B, z.ZodTypeDef, unknown>;
  errorMessage: string;
  handle: (input: { params: P; body: B }) => Promise<RouteResult<T>>;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
} as const;

const jsonResponse = (
  statusCode: number,
  body: SuccessResponse<unknown> | ErrorResponse,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    ...corsHeaders,
  },
  body: JSON.stringify(body),
});

const badRequest = (message: string, details?: Record<string, unknown>) =>
  jsonResponse(400, {
    success: false,
    error: { code: ErrorCode.VALIDATION_ERROR, message, details },
  });

const parseBody = (body: string | undefined): unknown => {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const formatZodErrors = (error: z.ZodError): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  return formatted;
};

// "potluckId" → "potluck ID", for messages like "Invalid potluck ID format"
const paramLabel = (name: string) => name.replace(/Id$/, " ID");

export const route =
  <P extends Record<string, unknown>, B, T>(config: RouteConfig<P, B, T>) =>
  async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    if (event.headers[WARMER_HEADER]) {
      return { statusCode: 200, body: "warm" };
    }

    const params = {} as Record<string, unknown>;
    for (const [name, schema] of Object.entries(config.params ?? {})) {
      const result = (schema as z.ZodType).safeParse(event.pathParameters?.[name]);
      if (!result.success) {
        return badRequest(`Invalid ${paramLabel(name)} format`);
      }
      params[name] = result.data;
    }

    let body: B = undefined as B;
    if (config.body) {
      const parsed = parseBody(event.body);
      if (parsed === null) {
        return badRequest("Request body is required");
      }
      const result = config.body.safeParse(parsed);
      if (!result.success) {
        return badRequest("Validation failed", { fields: formatZodErrors(result.error) });
      }
      body = result.data;
    }

    try {
      const result = await config.handle({ params: params as P, body });
      switch (result.kind) {
        case "ok":
          return jsonResponse(200, { success: true, data: result.data });
        case "created":
          return jsonResponse(201, { success: true, data: result.data });
        case "notFound":
          return jsonResponse(404, {
            success: false,
            error: { code: ErrorCode.NOT_FOUND, message: result.message },
          });
      }
    } catch {
      return jsonResponse(500, {
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: config.errorMessage },
      });
    }
  };
