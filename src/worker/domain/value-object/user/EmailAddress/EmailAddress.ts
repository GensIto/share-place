import { z } from "zod";

const emailSchema = z.email("Invalid email address");

export class EmailAddress {
  private constructor(private readonly _value: string) {}

  static of(value: string): EmailAddress {
    const validated = emailSchema.parse(value);
    return new EmailAddress(validated.toLowerCase());
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: EmailAddress }
    | { success: false; error: string } {
    const result = emailSchema.safeParse(value);
    if (result.success) {
      return {
        success: true,
        value: new EmailAddress(result.data.toLowerCase()),
      };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  getDomain(): string {
    return this._value.split("@")[1];
  }

  getLocalPart(): string {
    return this._value.split("@")[0];
  }

  equals(other: EmailAddress): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
