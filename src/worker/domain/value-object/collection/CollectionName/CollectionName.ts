import { z } from "zod";

const collectionNameSchema = z
  .string()
  .min(1, "Collection name cannot be empty")
  .max(100, "Collection name is too long");

export class CollectionName {
  private constructor(private readonly _value: string) {}

  static of(value: string): CollectionName {
    const validated = collectionNameSchema.parse(value);
    return new CollectionName(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: CollectionName }
    | { success: false; error: string } {
    const result = collectionNameSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CollectionName(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CollectionName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
