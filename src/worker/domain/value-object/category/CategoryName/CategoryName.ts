import { z } from "zod";

const categoryNameSchema = z
  .string()
  .min(1, "Category name cannot be empty")
  .max(50, "Category name is too long");

export class CategoryName {
  private constructor(private readonly _value: string) {}

  static of(value: string): CategoryName {
    const validated = categoryNameSchema.parse(value);
    return new CategoryName(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: CategoryName }
    | { success: false; error: string } {
    const result = categoryNameSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CategoryName(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CategoryName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
