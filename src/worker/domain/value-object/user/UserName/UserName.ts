import { z } from "zod";

const userNameSchema = z
  .string()
  .min(1, "User name is required")
  .max(100, "User name must be 100 characters or less")
  .trim();

export class UserName {
  private constructor(private readonly _value: string) {}

  static of(value: string): UserName {
    const validated = userNameSchema.parse(value);
    return new UserName(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: UserName } | { success: false; error: string } {
    const result = userNameSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new UserName(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
