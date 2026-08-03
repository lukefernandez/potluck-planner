import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

interface EventOptions {
  body?: unknown;
  rawBody?: string;
  headers?: Record<string, string>;
  pathParameters?: Record<string, string>;
}

export const apiEvent = (options: EventOptions = {}): APIGatewayProxyEventV2 => ({
  version: "2.0",
  routeKey: "$default",
  rawPath: "/",
  rawQueryString: "",
  headers: options.headers ?? {},
  requestContext: {
    accountId: "123456789012",
    apiId: "api",
    domainName: "example.com",
    domainPrefix: "example",
    http: {
      method: "GET",
      path: "/",
      protocol: "HTTP/1.1",
      sourceIp: "127.0.0.1",
      userAgent: "test",
    },
    requestId: "request-id",
    routeKey: "$default",
    stage: "$default",
    time: "",
    timeEpoch: 0,
  },
  isBase64Encoded: false,
  ...(options.pathParameters ? { pathParameters: options.pathParameters } : {}),
  ...(options.rawBody !== undefined
    ? { body: options.rawBody }
    : options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
});

export interface ApiEnvelope {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: { fields?: Record<string, string[]> };
  };
}

export const parseResult = (
  result: APIGatewayProxyResultV2,
): { statusCode: number | undefined; body: ApiEnvelope } => {
  if (typeof result !== "object" || result === null) {
    throw new Error("Expected a structured API Gateway result");
  }
  return {
    statusCode: result.statusCode,
    body: JSON.parse(result.body ?? "null") as ApiEnvelope,
  };
};
