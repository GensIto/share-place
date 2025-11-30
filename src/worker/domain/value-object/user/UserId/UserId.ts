import { z } from "zod";

const userIdSchema = z.uuid("Invalid user ID format");

export class UserId {
  private constructor(private readonly _value: string) {}

  static of(value: string): UserId {
    const validated = userIdSchema.parse(value);
    return new UserId(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: UserId } | { success: false; error: string } {
    const result = userIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new UserId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
