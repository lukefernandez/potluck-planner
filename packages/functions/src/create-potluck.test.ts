import "./test/env";

import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, test } from "bun:test";
import { mockClient } from "aws-sdk-client-mock";

import { createPotluck, handler } from "./create-potluck";
import { apiEvent, parseResult } from "./test/events";

const ddb = mockClient(DynamoDBDocumentClient);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

beforeEach(() => {
  ddb.reset();
});

describe("createPotluck", () => {
  test("creates a potluck and returns it", async () => {
    ddb.on(PutCommand).resolves({});

    const result = await createPotluck({ body: { name: "Friendsgiving 2026" } });

    if (result.kind !== "created") throw new Error(`expected created, got ${result.kind}`);
    expect(result.data.name).toBe("Friendsgiving 2026");
    expect(result.data.id).toMatch(UUID_PATTERN);
    expect(Date.parse(result.data.createdAt)).not.toBeNaN();

    const put = ddb.commandCalls(PutCommand)[0].args[0].input;
    expect(put.TableName).toBe("PotluckTableTest");
    expect(put.Item).toMatchObject({
      pk: `POTLUCK#${result.data.id}`,
      sk: `POTLUCK#${result.data.id}`,
      entityType: "POTLUCK",
      name: "Friendsgiving 2026",
    });
  });

  test("the wired route maps failures to this route's error message", async () => {
    ddb.on(PutCommand).rejects(new Error("boom"));

    const { statusCode, body } = parseResult(
      await handler(apiEvent({ body: { name: "Friendsgiving 2026" } })),
    );

    expect(statusCode).toBe(500);
    expect(body.error?.message).toBe("Failed to create potluck. Please try again.");
  });
});
