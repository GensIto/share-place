import { z } from "zod";

const ACTION_TYPES = ["LIKE", "NOPE", "VIEW"] as const;
type ActionTypeValue = (typeof ACTION_TYPES)[number];

const actionTypeSchema = z.enum(ACTION_TYPES, {
  error: "Action type must be one of: LIKE, NOPE, VIEW",
});

export class ActionType {
  private constructor(private readonly _value: ActionTypeValue) {}

  static of(value: string): ActionType {
    const validated = actionTypeSchema.parse(value);
    return new ActionType(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: ActionType } | { success: false; error: string } {
    const result = actionTypeSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new ActionType(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  static LIKE(): ActionType {
    return new ActionType("LIKE");
  }

  static NOPE(): ActionType {
    return new ActionType("NOPE");
  }

  static VIEW(): ActionType {
    return new ActionType("VIEW");
  }

  get value(): ActionTypeValue {
    return this._value;
  }

  isLike(): boolean {
    return this._value === "LIKE";
  }

  isNope(): boolean {
    return this._value === "NOPE";
  }

  isView(): boolean {
    return this._value === "VIEW";
  }

  equals(other: ActionType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
