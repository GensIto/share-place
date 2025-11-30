import { z } from "zod";

const longitudeSchema = z
  .number()
  .min(-180, "Longitude must be >= -180")
  .max(180, "Longitude must be <= 180");

export class Longitude {
  private constructor(private readonly _value: number) {}

  static of(value: number): Longitude {
    const validated = longitudeSchema.parse(value);
    return new Longitude(validated);
  }

  static tryOf(
    value: number
  ): { success: true; value: Longitude } | { success: false; error: string } {
    const result = longitudeSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new Longitude(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: Longitude): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
