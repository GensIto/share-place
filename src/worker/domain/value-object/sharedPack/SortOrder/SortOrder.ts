import { z } from "zod";

const sortOrderSchema = z
  .number()
  .int("Sort order must be an integer")
  .min(0, "Sort order cannot be negative");

export class SortOrder {
  private constructor(private readonly _value: number) {}

  static of(value: number): SortOrder {
    const validated = sortOrderSchema.parse(value);
    return new SortOrder(validated);
  }

  static tryOf(
    value: number
  ): { success: true; value: SortOrder } | { success: false; error: string } {
    const result = sortOrderSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new SortOrder(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: SortOrder): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
