import { z } from "zod";

const userIdSchema = z.uuid("Invalid user ID format");
// Firebase AuthのuidはUUID形式ではないため、別のバリデーションを使用
const firebaseUserIdSchema = z.string().min(1).max(128);

export class UserId {
  private constructor(private readonly _value: string) {}

  static of(value: string): UserId {
    const validated = userIdSchema.parse(value);
    return new UserId(validated);
  }

  /**
   * Firebase AuthのuidからUserIdを作成
   * Firebase AuthのuidはUUID形式ではないため、専用のファクトリーメソッドを使用
   */
  static ofFirebase(value: string): UserId {
    const validated = firebaseUserIdSchema.parse(value);
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
