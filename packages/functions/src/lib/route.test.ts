import { createPotluckSchema, uuidSchema } from "@potluck/contract/schema";
import { describe, expect, test } from "bun:test";

import { created, notFound, ok, route } from "./route";
import { apiEvent, parseResult } from "../test/events";

const POTLUCK_ID = "0f1e2d3c-4b5a-6978-8695-a4b3c2d1e0f9";

const okRoute = route({
  params: { potluckId: uuidSchema },
  body: createPotluckSchema,
  errorMessage: "Probe failed. Please try again.",
  handle: async ({ params, body }) => ok({ params, body }),
});

describe("route", () => {
  test("short-circuits warmer requests before validation", async () => {
    const result = await okRoute(apiEvent({ headers: { "x-warmer": "true" } }));

    expect(result).toEqual({ statusCode: 200, body: "warm" });
  });

  test("rejects a malformed path parameter, named in the message", async () => {
    const { statusCode, body } = parseResult(
      await okRoute(apiEvent({ pathParameters: { potluckId: "nope" }, body: { name: "x" } })),
    );

    expect(statusCode).toBe(400);
    expect(body.error?.code).toBe("VALIDATION_ERROR");
    expect(body.error?.message).toBe("Invalid potluck ID format");
  });

  test("rejects a missing body", async () => {
    const { statusCode, body } = parseResult(
      await okRoute(apiEvent({ pathParameters: { potluckId: POTLUCK_ID } })),
    );

    expect(statusCode).toBe(400);
    expect(body.error?.message).toBe("Request body is required");
  });

  test("rejects a body that is not valid JSON", async () => {
    const { statusCode, body } = parseResult(
      await okRoute(apiEvent({ pathParameters: { potluckId: POTLUCK_ID }, rawBody: "{nope" })),
    );

    expect(statusCode).toBe(400);
    expect(body.error?.message).toBe("Request body is required");
  });

  test("rejects an invalid body with field-level errors", async () => {
    const { statusCode, body } = parseResult(
      await okRoute(apiEvent({ pathParameters: { potluckId: POTLUCK_ID }, body: { name: "" } })),
    );

    expect(statusCode).toBe(400);
    expect(body.error?.message).toBe("Validation failed");
    expect(body.error?.details?.fields?.name).toEqual(["Name is required"]);
  });

  test("passes validated params and body to the handler and wraps ok in the envelope", async () => {
    const event = apiEvent({
      pathParameters: { potluckId: POTLUCK_ID },
      body: { name: "Friendsgiving" },
    });
    const raw = await okRoute(event);
    const { statusCode, body } = parseResult(raw);

    expect(statusCode).toBe(200);
    expect(body).toEqual({
      success: true,
      data: { params: { potluckId: POTLUCK_ID }, body: { name: "Friendsgiving" } },
    });
    if (typeof raw !== "object") throw new Error("expected structured result");
    expect(raw.headers).toMatchObject({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
  });

  test("maps created to 201", async () => {
    const createdRoute = route({
      errorMessage: "Probe failed.",
      handle: async () => created({ id: "x" }),
    });

    const { statusCode, body } = parseResult(await createdRoute(apiEvent()));

    expect(statusCode).toBe(201);
    expect(body.data).toEqual({ id: "x" });
  });

  test("maps notFound to 404", async () => {
    const missingRoute = route({
      errorMessage: "Probe failed.",
      handle: async () => notFound("Potluck not found"),
    });

    const { statusCode, body } = parseResult(await missingRoute(apiEvent()));

    expect(statusCode).toBe(404);
    expect(body.error).toEqual({ code: "NOT_FOUND", message: "Potluck not found" });
  });

  test("maps a thrown error to 500 with the route's message", async () => {
    const throwingRoute = route({
      errorMessage: "Probe failed. Please try again.",
      handle: async () => {
        throw new Error("boom");
      },
    });

    const { statusCode, body } = parseResult(await throwingRoute(apiEvent()));

    expect(statusCode).toBe(500);
    expect(body.error).toEqual({
      code: "INTERNAL_ERROR",
      message: "Probe failed. Please try again.",
    });
  });
});
