import { z } from "zod";

const packTitleSchema = z
  .string()
  .min(1, "Pack title cannot be empty")
  .max(200, "Pack title is too long");

export class PackTitle {
  private constructor(private readonly _value: string) {}

  static of(value: string): PackTitle {
    const validated = packTitleSchema.parse(value);
    return new PackTitle(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: PackTitle } | { success: false; error: string } {
    const result = packTitleSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new PackTitle(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: PackTitle): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
