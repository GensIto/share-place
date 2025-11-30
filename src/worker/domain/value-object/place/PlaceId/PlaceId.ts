import { z } from "zod";

// Google Place ID format: starts with "ChIJ" followed by alphanumeric characters
const placeIdSchema = z
  .string()
  .min(1, "Place ID cannot be empty")
  .max(255, "Place ID is too long");

export class PlaceId {
  private constructor(private readonly _value: string) {}

  static of(value: string): PlaceId {
    const validated = placeIdSchema.parse(value);
    return new PlaceId(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: PlaceId } | { success: false; error: string } {
    const result = placeIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new PlaceId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: PlaceId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
