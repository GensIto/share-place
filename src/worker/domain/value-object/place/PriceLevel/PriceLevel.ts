import { z } from "zod";

const priceLevelSchema = z
  .number()
  .int("Price level must be an integer")
  .min(0, "Price level must be >= 0")
  .max(4, "Price level must be <= 4");

export class PriceLevel {
  private constructor(private readonly _value: number) {}

  static of(value: number): PriceLevel {
    const validated = priceLevelSchema.parse(value);
    return new PriceLevel(validated);
  }

  static tryOf(
    value: number
  ): { success: true; value: PriceLevel } | { success: false; error: string } {
    const result = priceLevelSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new PriceLevel(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: PriceLevel): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
