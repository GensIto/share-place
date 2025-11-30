import { z } from "zod";

const latitudeSchema = z
  .number()
  .min(-90, "Latitude must be >= -90")
  .max(90, "Latitude must be <= 90");

export class Latitude {
  private constructor(private readonly _value: number) {}

  static of(value: number): Latitude {
    const validated = latitudeSchema.parse(value);
    return new Latitude(validated);
  }

  static tryOf(
    value: number
  ): { success: true; value: Latitude } | { success: false; error: string } {
    const result = latitudeSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new Latitude(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: Latitude): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
