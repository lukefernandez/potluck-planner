// The dietary-flags module: the registry is the single source for the flag
// keys — schema fields, types, form chips, and badges all derive from it.
// Deliberately zod-free so the web bundle only pays for this file.

export const DIETARY_FLAGS = [
  { key: "containsNuts", label: "Nuts" },
  { key: "containsGluten", label: "Gluten" },
  { key: "containsMeat", label: "Meat" },
  { key: "containsFish", label: "Fish" },
  { key: "containsShellfish", label: "Shellfish" },
  { key: "containsEggs", label: "Eggs" },
  { key: "containsDairy", label: "Dairy" },
  { key: "containsOtherAnimalProducts", label: "Other Animal Products" },
] as const;

export type DietaryFlagKey = (typeof DIETARY_FLAGS)[number]["key"];

export type DietaryInfo = Record<DietaryFlagKey, boolean>;

export interface DietaryBadge {
  label: string;
  kind: "diet" | "free-from";
}

// Diet badges are mutually exclusive and strongest-first; free-from badges
// stack. Order here is the display order.
export const classify = (item: DietaryInfo): DietaryBadge[] => {
  const badges: DietaryBadge[] = [];

  const isVegan =
    !item.containsMeat &&
    !item.containsFish &&
    !item.containsShellfish &&
    !item.containsEggs &&
    !item.containsDairy &&
    !item.containsOtherAnimalProducts;
  const isVegetarian = !item.containsMeat && !item.containsFish && !item.containsShellfish;
  const isPescatarian = !item.containsMeat;

  if (isVegan) {
    badges.push({ label: "Vegan", kind: "diet" });
  } else if (isVegetarian) {
    badges.push({ label: "Vegetarian", kind: "diet" });
  } else if (isPescatarian) {
    badges.push({ label: "Pescatarian", kind: "diet" });
  }

  if (!item.containsDairy) badges.push({ label: "Dairy-free", kind: "free-from" });
  if (!item.containsEggs) badges.push({ label: "Egg-free", kind: "free-from" });
  if (!item.containsNuts) badges.push({ label: "Nut-free", kind: "free-from" });
  if (!item.containsGluten) badges.push({ label: "Gluten-free", kind: "free-from" });

  return badges;
};
