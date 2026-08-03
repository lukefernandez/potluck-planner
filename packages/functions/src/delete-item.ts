import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { uuidSchema } from "@potluck/contract/schema";

import { dynamodb, Keys, TableName } from "./lib/dynamodb";
import { notFound, ok, route, type RouteResult } from "./lib/route";

export const deleteItem = async ({
  params,
}: {
  params: { potluckId: string; itemId: string };
}): Promise<RouteResult<{ message: string }>> => {
  const key = Keys.item(params.potluckId, params.itemId);

  const existing = await dynamodb.send(new GetCommand({ TableName, Key: key }));

  if (!existing.Item) {
    return notFound("Item not found");
  }

  await dynamodb.send(new DeleteCommand({ TableName, Key: key }));

  return ok({ message: "Item deleted successfully" });
};

export const handler = route({
  params: { potluckId: uuidSchema, itemId: uuidSchema },
  errorMessage: "Failed to delete item. Please try again.",
  handle: deleteItem,
});
