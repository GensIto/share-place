import { z } from "zod";

const categoryTagSchema = z
  .string()
  .min(1, "Category tag cannot be empty")
  .max(100, "Category tag is too long");

export class CategoryTag {
  private constructor(private readonly _value: string) {}

  static of(value: string): CategoryTag {
    const validated = categoryTagSchema.parse(value);
    return new CategoryTag(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: CategoryTag } | { success: false; error: string } {
    const result = categoryTagSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CategoryTag(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CategoryTag): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
