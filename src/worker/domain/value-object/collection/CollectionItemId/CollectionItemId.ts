import { z } from "zod";

const collectionItemIdSchema = z
  .number()
  .int("Collection item ID must be an integer")
  .positive("Collection item ID must be positive");

export class CollectionItemId {
  private constructor(private readonly _value: number) {}

  static of(value: number): CollectionItemId {
    const validated = collectionItemIdSchema.parse(value);
    return new CollectionItemId(validated);
  }

  static tryOf(
    value: number
  ):
    | { success: true; value: CollectionItemId }
    | { success: false; error: string } {
    const result = collectionItemIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CollectionItemId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: CollectionItemId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
