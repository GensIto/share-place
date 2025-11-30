import { z } from "zod";

const sharedPackItemIdSchema = z
  .number()
  .int("Shared pack item ID must be an integer")
  .positive("Shared pack item ID must be positive");

export class SharedPackItemId {
  private constructor(private readonly _value: number) {}

  static of(value: number): SharedPackItemId {
    const validated = sharedPackItemIdSchema.parse(value);
    return new SharedPackItemId(validated);
  }

  static tryOf(
    value: number
  ):
    | { success: true; value: SharedPackItemId }
    | { success: false; error: string } {
    const result = sharedPackItemIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new SharedPackItemId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: SharedPackItemId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
