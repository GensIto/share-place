import { z } from "zod";

// 絵文字のUnicode正規表現（基本的な絵文字パターン）
const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;

const categoryEmojiSchema = z
  .string()
  .regex(emojiRegex, "Category emoji must be a valid emoji");

export class CategoryEmoji {
  private constructor(private readonly _value: string) {}

  static of(value: string): CategoryEmoji {
    const validated = categoryEmojiSchema.parse(value);
    return new CategoryEmoji(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: CategoryEmoji }
    | { success: false; error: string } {
    const result = categoryEmojiSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CategoryEmoji(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CategoryEmoji): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
