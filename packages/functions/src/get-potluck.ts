import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { uuidSchema, type Item, type Potluck } from "@potluck/contract/schema";

import { dynamodb, Keys, TableName } from "./lib/dynamodb";
import { notFound, ok, route, type RouteResult } from "./lib/route";
import { toItem, toPotluck, type ItemEntity, type PotluckEntity } from "./lib/schema";

export const getPotluck = async ({
  params,
}: {
  params: { potluckId: string };
}): Promise<RouteResult<{ potluck: Potluck; items: Item[] }>> => {
  // One query returns both the potluck record and all item records
  const response = await dynamodb.send(
    new QueryCommand({
      TableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": Keys.potluckPartition(params.potluckId),
      },
    }),
  );

  const records = response.Items ?? [];

  const potluckEntity = records.find(
    (record): record is PotluckEntity => record.entityType === "POTLUCK",
  );

  if (!potluckEntity) {
    return notFound("Potluck not found");
  }

  const itemEntities = records.filter(
    (record): record is ItemEntity => record.entityType === "ITEM",
  );

  return ok({
    potluck: toPotluck(potluckEntity),
    items: itemEntities.map(toItem),
  });
};

export const handler = route({
  params: { potluckId: uuidSchema },
  errorMessage: "Failed to retrieve potluck. Please try again.",
  handle: getPotluck,
});
