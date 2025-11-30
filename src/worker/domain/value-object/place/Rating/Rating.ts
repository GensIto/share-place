import { z } from "zod";

const ratingSchema = z
  .number()
  .min(1.0, "Rating must be >= 1.0")
  .max(5.0, "Rating must be <= 5.0");

export class Rating {
  private constructor(private readonly _value: number) {}

  static of(value: number): Rating {
    const validated = ratingSchema.parse(value);
    return new Rating(validated);
  }

  static tryOf(
    value: number
  ): { success: true; value: Rating } | { success: false; error: string } {
    const result = ratingSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new Rating(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: Rating): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
