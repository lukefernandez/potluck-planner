import "./test/env";

import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, test } from "bun:test";
import { mockClient } from "aws-sdk-client-mock";

import { getPotluck, handler } from "./get-potluck";
import { apiEvent, parseResult } from "./test/events";

const ddb = mockClient(DynamoDBDocumentClient);
const POTLUCK_ID = "0f1e2d3c-4b5a-6978-8695-a4b3c2d1e0f9";

const input = { params: { potluckId: POTLUCK_ID } };

beforeEach(() => {
  ddb.reset();
});

describe("getPotluck", () => {
  test("returns notFound when the partition holds no potluck record", async () => {
    ddb.on(QueryCommand).resolves({ Items: [] });

    const result = await getPotluck(input);

    expect(result).toEqual({ kind: "notFound", message: "Potluck not found" });
  });

  test("returns the potluck with its items", async () => {
    ddb.on(QueryCommand).resolves({
      Items: [
        {
          pk: `POTLUCK#${POTLUCK_ID}`,
          sk: `POTLUCK#${POTLUCK_ID}`,
          id: POTLUCK_ID,
          name: "Friendsgiving 2026",
          createdAt: "2026-07-01T00:00:00.000Z",
          entityType: "POTLUCK",
        },
        {
          pk: `POTLUCK#${POTLUCK_ID}`,
          sk: "ITEM#11111111-1111-4111-8111-111111111111",
          id: "11111111-1111-4111-8111-111111111111",
          name: "Mac and cheese",
          person: "Sam",
          potluckId: POTLUCK_ID,
          createdAt: "2026-07-02T00:00:00.000Z",
          entityType: "ITEM",
          containsDairy: true,
          containsGluten: true,
        },
      ],
    });

    const result = await getPotluck(input);

    if (result.kind !== "ok") throw new Error(`expected ok, got ${result.kind}`);
    expect(result.data.potluck).toEqual({
      id: POTLUCK_ID,
      name: "Friendsgiving 2026",
      createdAt: "2026-07-01T00:00:00.000Z",
    });
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]).toMatchObject({
      name: "Mac and cheese",
      person: "Sam",
      containsDairy: true,
      containsGluten: true,
    });

    const query = ddb.commandCalls(QueryCommand)[0].args[0].input;
    expect(query.ExpressionAttributeValues).toEqual({ ":pk": `POTLUCK#${POTLUCK_ID}` });
  });

  test("the wired route maps failures to this route's error message", async () => {
    ddb.on(QueryCommand).rejects(new Error("boom"));

    const { statusCode, body } = parseResult(
      await handler(apiEvent({ pathParameters: { potluckId: POTLUCK_ID } })),
    );

    expect(statusCode).toBe(500);
    expect(body.error?.message).toBe("Failed to retrieve potluck. Please try again.");
  });
});
