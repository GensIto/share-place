import { describe, it, expect } from "vitest";
import { CategoryTag } from "./CategoryTag";

describe("CategoryTag", () => {
  describe("of", () => {
    it("有効なカテゴリタグを作成できること", () => {
      const tag = CategoryTag.of("cafe");
      expect(tag.value).toBe("cafe");
    });

    it("空の文字列でエラーをスローすること", () => {
      expect(() => CategoryTag.of("")).toThrow();
    });

    it("長すぎる文字列でエラーをスローすること", () => {
      const longString = "a".repeat(101);
      expect(() => CategoryTag.of(longString)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なカテゴリタグで成功を返すこと", () => {
      const result = CategoryTag.tryOf("sauna");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("sauna");
      }
    });

    it("空の文字列でエラーを返すこと", () => {
      const result = CategoryTag.tryOf("");
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const tag1 = CategoryTag.of("cafe");
      const tag2 = CategoryTag.of("cafe");
      expect(tag1.equals(tag2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const tag1 = CategoryTag.of("cafe");
      const tag2 = CategoryTag.of("restaurant");
      expect(tag1.equals(tag2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const tag = CategoryTag.of("cafe");
      expect(tag.toString()).toBe("cafe");
    });
  });
});
