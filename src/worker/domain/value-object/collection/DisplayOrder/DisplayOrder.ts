import { z } from "zod";

const displayOrderSchema = z
  .number()
  .int("Display order must be an integer")
  .min(0, "Display order cannot be negative");

export class DisplayOrder {
  private constructor(private readonly _value: number) {}

  static of(value: number): DisplayOrder {
    const validated = displayOrderSchema.parse(value);
    return new DisplayOrder(validated);
  }

  static tryOf(
    value: number
  ):
    | { success: true; value: DisplayOrder }
    | { success: false; error: string } {
    const result = displayOrderSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new DisplayOrder(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: DisplayOrder): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
