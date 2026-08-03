import { DIETARY_FLAGS, type DietaryInfo } from "@potluck/contract/dietary";
import type { Item, Potluck } from "@potluck/contract/schema";

// Entity shapes (what we store in DynamoDB)

export interface PotluckEntity {
  pk: string;
  sk: string;
  id: string;
  name: string;
  createdAt: string;
  entityType: "POTLUCK";
}

// Dietary flags are optional on the entity: rows written before a flag
// existed simply lack the attribute, and toItem backfills false.
export interface ItemEntity extends Partial<DietaryInfo> {
  pk: string;
  sk: string;
  id: string;
  name: string;
  person: string;
  potluckId: string;
  createdAt: string;
  entityType: "ITEM";
}

// Transform DynamoDB entities to contract shapes

export const toPotluck = (entity: PotluckEntity): Potluck => ({
  id: entity.id,
  name: entity.name,
  createdAt: entity.createdAt,
});

export const toItem = (entity: ItemEntity): Item => ({
  id: entity.id,
  name: entity.name,
  person: entity.person,
  potluckId: entity.potluckId,
  createdAt: entity.createdAt,
  ...(Object.fromEntries(
    DIETARY_FLAGS.map((flag) => [flag.key, entity[flag.key] ?? false]),
  ) as DietaryInfo),
});
