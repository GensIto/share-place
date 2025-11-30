import { z } from "zod";

const userActionIdSchema = z
  .number()
  .int("User action ID must be an integer")
  .positive("User action ID must be positive");

export class UserActionId {
  private constructor(private readonly _value: number) {}

  static of(value: number): UserActionId {
    const validated = userActionIdSchema.parse(value);
    return new UserActionId(validated);
  }

  static tryOf(
    value: number
  ):
    | { success: true; value: UserActionId }
    | { success: false; error: string } {
    const result = userActionIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new UserActionId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: UserActionId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
