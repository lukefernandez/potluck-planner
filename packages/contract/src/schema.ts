import { z } from "zod";

import { DIETARY_FLAGS, type DietaryFlagKey, type DietaryInfo } from "./dietary";

// Input schemas

export const createPotluckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less"),
});

export type CreatePotluckInput = z.infer<typeof createPotluckSchema>;

// The dietary fields are generated from the registry; the cast keeps the
// inferred type on exact keys instead of a string record.
const dietaryShape = Object.fromEntries(
  DIETARY_FLAGS.map((flag) => [flag.key, z.boolean().default(false)]),
) as Record<DietaryFlagKey, z.ZodDefault<z.ZodBoolean>>;

export const createItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(255, "Item name must be 255 characters or less"),
  person: z
    .string()
    .min(1, "Person name is required")
    .max(255, "Person name must be 255 characters or less"),
  ...dietaryShape,
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const uuidSchema = z.string().uuid("Invalid UUID format");

// Resource shapes crossing the web ↔ API seam

export interface Potluck {
  id: string;
  name: string;
  createdAt: string;
}

export interface Item extends DietaryInfo {
  id: string;
  name: string;
  person: string;
  potluckId: string;
  createdAt: string;
}

// Response envelope

export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  // Synthesized by the web client when the request never reached the API;
  // the wire itself never carries this code.
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
