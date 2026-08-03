import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  createItemSchema,
  uuidSchema,
  type CreateItemInput,
  type Item,
} from "@potluck/contract/schema";
import { randomUUID } from "crypto";

import { dynamodb, Keys, TableName } from "./lib/dynamodb";
import { created, notFound, route, type RouteResult } from "./lib/route";
import { toItem, type ItemEntity } from "./lib/schema";

export const createItem = async ({
  params,
  body,
}: {
  params: { potluckId: string };
  body: CreateItemInput;
}): Promise<RouteResult<Item>> => {
  const potluckResponse = await dynamodb.send(
    new GetCommand({ TableName, Key: Keys.potluck(params.potluckId) }),
  );

  if (!potluckResponse.Item) {
    return notFound("Potluck not found");
  }

  const itemId = randomUUID();
  const now = new Date().toISOString();

  const entity: ItemEntity = {
    ...Keys.item(params.potluckId, itemId),
    ...body,
    id: itemId,
    potluckId: params.potluckId,
    createdAt: now,
    entityType: "ITEM",
  };

  await dynamodb.send(new PutCommand({ TableName, Item: entity }));

  return created(toItem(entity));
};

export const handler = route({
  params: { potluckId: uuidSchema },
  body: createItemSchema,
  errorMessage: "Failed to create item. Please try again.",
  handle: createItem,
});
