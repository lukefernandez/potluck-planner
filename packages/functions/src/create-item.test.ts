import "./test/env";

import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createItemSchema } from "@potluck/contract/schema";
import { beforeEach, describe, expect, test } from "bun:test";
import { mockClient } from "aws-sdk-client-mock";

import { createItem, handler } from "./create-item";
import { apiEvent, parseResult } from "./test/events";

const ddb = mockClient(DynamoDBDocumentClient);
const POTLUCK_ID = "0f1e2d3c-4b5a-6978-8695-a4b3c2d1e0f9";

const potluckRecord = {
  pk: `POTLUCK#${POTLUCK_ID}`,
  sk: `POTLUCK#${POTLUCK_ID}`,
  id: POTLUCK_ID,
  name: "Friendsgiving 2026",
  createdAt: "2026-07-01T00:00:00.000Z",
  entityType: "POTLUCK",
};

// Run raw input through the contract schema, exactly as the chassis would.
const inputFor = (body: Record<string, unknown>) => ({
  params: { potluckId: POTLUCK_ID },
  body: createItemSchema.parse(body),
});

beforeEach(() => {
  ddb.reset();
});

describe("createItem", () => {
  test("returns notFound when the potluck does not exist", async () => {
    ddb.on(GetCommand).resolves({});

    const result = await createItem(inputFor({ name: "Rolls", person: "Ada" }));

    expect(result).toEqual({ kind: "notFound", message: "Potluck not found" });
    expect(ddb.commandCalls(PutCommand)).toHaveLength(0);
  });

  test("creates an item, carrying the validated dietary flags", async () => {
    ddb.on(GetCommand).resolves({ Item: potluckRecord });
    ddb.on(PutCommand).resolves({});

    const result = await createItem(
      inputFor({ name: "Rolls", person: "Ada", containsGluten: true }),
    );

    if (result.kind !== "created") throw new Error(`expected created, got ${result.kind}`);
    expect(result.data).toMatchObject({
      name: "Rolls",
      person: "Ada",
      potluckId: POTLUCK_ID,
      containsGluten: true,
      containsMeat: false,
      containsDairy: false,
    });

    const put = ddb.commandCalls(PutCommand)[0].args[0].input;
    expect(put.Item).toMatchObject({
      pk: `POTLUCK#${POTLUCK_ID}`,
      sk: `ITEM#${result.data.id}`,
      entityType: "ITEM",
    });
  });

  test("the wired route maps failures to this route's error message", async () => {
    ddb.on(GetCommand).rejects(new Error("boom"));

    const { statusCode, body } = parseResult(
      await handler(
        apiEvent({
          pathParameters: { potluckId: POTLUCK_ID },
          body: { name: "Rolls", person: "Ada" },
        }),
      ),
    );

    expect(statusCode).toBe(500);
    expect(body.error?.message).toBe("Failed to create item. Please try again.");
  });
});
