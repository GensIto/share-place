import { z } from "zod";

const shareTokenSchema = z
  .string()
  .min(1, "Share token cannot be empty")
  .max(64, "Share token is too long")
  .regex(/^[a-zA-Z0-9]+$/, "Share token must be alphanumeric");

export class ShareToken {
  private constructor(private readonly _value: string) {}

  static of(value: string): ShareToken {
    const validated = shareTokenSchema.parse(value);
    return new ShareToken(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: ShareToken } | { success: false; error: string } {
    const result = shareTokenSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new ShareToken(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: ShareToken): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
