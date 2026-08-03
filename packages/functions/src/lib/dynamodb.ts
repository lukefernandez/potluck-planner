import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

const client = new DynamoDBClient({});

export const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TableName = Resource.PotluckTable.name;

// Key prefixes for single-table design
export const Keys = {
  potluck: (id: string) => ({
    pk: `POTLUCK#${id}`,
    sk: `POTLUCK#${id}`,
  }),
  item: (potluckId: string, itemId: string) => ({
    pk: `POTLUCK#${potluckId}`,
    sk: `ITEM#${itemId}`,
  }),
  potluckPartition: (potluckId: string) => `POTLUCK#${potluckId}`,
} as const;
