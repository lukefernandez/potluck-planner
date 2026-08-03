import "./test/env";

import { DeleteCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { beforeEach, describe, expect, test } from "bun:test";
import { mockClient } from "aws-sdk-client-mock";

import { deleteItem, handler } from "./delete-item";
import { apiEvent, parseResult } from "./test/events";

const ddb = mockClient(DynamoDBDocumentClient);
const POTLUCK_ID = "0f1e2d3c-4b5a-6978-8695-a4b3c2d1e0f9";
const ITEM_ID = "11111111-1111-4111-8111-111111111111";

const input = { params: { potluckId: POTLUCK_ID, itemId: ITEM_ID } };
const itemKey = { pk: `POTLUCK#${POTLUCK_ID}`, sk: `ITEM#${ITEM_ID}` };

beforeEach(() => {
  ddb.reset();
});

describe("deleteItem", () => {
  test("returns notFound when the item does not exist", async () => {
    ddb.on(GetCommand).resolves({});

    const result = await deleteItem(input);

    expect(result).toEqual({ kind: "notFound", message: "Item not found" });
    expect(ddb.commandCalls(DeleteCommand)).toHaveLength(0);
  });

  test("deletes an existing item", async () => {
    ddb.on(GetCommand).resolves({ Item: { ...itemKey, entityType: "ITEM" } });
    ddb.on(DeleteCommand).resolves({});

    const result = await deleteItem(input);

    expect(result).toEqual({ kind: "ok", data: { message: "Item deleted successfully" } });

    const del = ddb.commandCalls(DeleteCommand)[0].args[0].input;
    expect(del.Key).toEqual(itemKey);
  });

  test("the wired route maps failures to this route's error message", async () => {
    ddb.on(GetCommand).rejects(new Error("boom"));

    const { statusCode, body } = parseResult(
      await handler(apiEvent({ pathParameters: { potluckId: POTLUCK_ID, itemId: ITEM_ID } })),
    );

    expect(statusCode).toBe(500);
    expect(body.error?.message).toBe("Failed to delete item. Please try again.");
  });
});
