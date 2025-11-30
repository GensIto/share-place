import { describe, it, expect } from "vitest";
import { PackTitle } from "./PackTitle";

describe("PackTitle", () => {
  describe("of", () => {
    it("有効なPackTitleを作成できること", () => {
      const title = PackTitle.of("渋谷のおすすめカフェ");
      expect(title.value).toBe("渋谷のおすすめカフェ");
    });

    it("空の文字列でエラーをスローすること", () => {
      expect(() => PackTitle.of("")).toThrow();
    });

    it("長すぎる文字列でエラーをスローすること", () => {
      const longString = "a".repeat(201);
      expect(() => PackTitle.of(longString)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = PackTitle.tryOf("My Favorite Spots");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("My Favorite Spots");
      }
    });

    it("空の文字列でエラーを返すこと", () => {
      const result = PackTitle.tryOf("");
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const title1 = PackTitle.of("Tokyo Cafes");
      const title2 = PackTitle.of("Tokyo Cafes");
      expect(title1.equals(title2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const title1 = PackTitle.of("Tokyo Cafes");
      const title2 = PackTitle.of("Osaka Restaurants");
      expect(title1.equals(title2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const title = PackTitle.of("Tokyo Cafes");
      expect(title.toString()).toBe("Tokyo Cafes");
    });
  });
});
