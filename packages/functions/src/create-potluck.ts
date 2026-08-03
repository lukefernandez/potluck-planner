import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  createPotluckSchema,
  type CreatePotluckInput,
  type Potluck,
} from "@potluck/contract/schema";
import { randomUUID } from "crypto";

import { dynamodb, Keys, TableName } from "./lib/dynamodb";
import { created, route, type RouteResult } from "./lib/route";
import { toPotluck, type PotluckEntity } from "./lib/schema";

export const createPotluck = async ({
  body,
}: {
  body: CreatePotluckInput;
}): Promise<RouteResult<Potluck>> => {
  const id = randomUUID();
  const now = new Date().toISOString();

  const entity: PotluckEntity = {
    ...Keys.potluck(id),
    id,
    name: body.name,
    createdAt: now,
    entityType: "POTLUCK",
  };

  await dynamodb.send(new PutCommand({ TableName, Item: entity }));

  return created(toPotluck(entity));
};

export const handler = route({
  body: createPotluckSchema,
  errorMessage: "Failed to create potluck. Please try again.",
  handle: createPotluck,
});
