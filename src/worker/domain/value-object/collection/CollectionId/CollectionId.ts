import { z } from "zod";

const collectionIdSchema = z.uuid("Collection ID must be a valid UUID");

export class CollectionId {
  private constructor(private readonly _value: string) {}

  static of(value: string): CollectionId {
    const validated = collectionIdSchema.parse(value);
    return new CollectionId(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: CollectionId }
    | { success: false; error: string } {
    const result = collectionIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CollectionId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CollectionId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
