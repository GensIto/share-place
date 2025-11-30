import { describe, it, expect } from "vitest";
import { CategoryEmoji } from "./CategoryEmoji";

describe("CategoryEmoji", () => {
  describe("of", () => {
    it("有効な絵文字でCategoryEmojiを作成できること", () => {
      const emoji = CategoryEmoji.of("☕");
      expect(emoji.value).toBe("☕");
    });

    it("複数の絵文字バリエーションを受け付けること", () => {
      expect(CategoryEmoji.of("🍽️").value).toBe("🍽️");
      expect(CategoryEmoji.of("🏃").value).toBe("🏃");
      expect(CategoryEmoji.of("🎵").value).toBe("🎵");
    });

    it("通常の文字列でエラーをスローすること", () => {
      expect(() => CategoryEmoji.of("cafe")).toThrow();
      expect(() => CategoryEmoji.of("A")).toThrow();
      expect(() => CategoryEmoji.of("あ")).toThrow();
    });

    it("空文字でエラーをスローすること", () => {
      expect(() => CategoryEmoji.of("")).toThrow();
    });

    it("複数の絵文字でエラーをスローすること", () => {
      expect(() => CategoryEmoji.of("☕🍽️")).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な絵文字で成功を返すこと", () => {
      const result = CategoryEmoji.tryOf("🎉");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("🎉");
      }
    });

    it("無効な値でエラーを返すこと", () => {
      const result = CategoryEmoji.tryOf("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ絵文字で true を返すこと", () => {
      const emoji1 = CategoryEmoji.of("☕");
      const emoji2 = CategoryEmoji.of("☕");
      expect(emoji1.equals(emoji2)).toBe(true);
    });

    it("異なる絵文字で false を返すこと", () => {
      const emoji1 = CategoryEmoji.of("☕");
      const emoji2 = CategoryEmoji.of("🍽️");
      expect(emoji1.equals(emoji2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("絵文字を返すこと", () => {
      const emoji = CategoryEmoji.of("🎵");
      expect(emoji.toString()).toBe("🎵");
    });
  });
});
