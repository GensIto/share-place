import { z } from "zod";

const categoryIdSchema = z.uuid("Category ID must be a valid UUID");

export class CategoryId {
  private constructor(private readonly _value: string) {}

  static of(value: string): CategoryId {
    const validated = categoryIdSchema.parse(value);
    return new CategoryId(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: CategoryId }
    | { success: false; error: string } {
    const result = categoryIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CategoryId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CategoryId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
