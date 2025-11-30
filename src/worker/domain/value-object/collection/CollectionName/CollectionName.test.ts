import { describe, it, expect } from "vitest";
import { CollectionName } from "./CollectionName";

describe("CollectionName", () => {
  describe("of", () => {
    it("有効なCollectionNameを作成できること", () => {
      const name = CollectionName.of("Date Night");
      expect(name.value).toBe("Date Night");
    });

    it("空の文字列でエラーをスローすること", () => {
      expect(() => CollectionName.of("")).toThrow();
    });

    it("長すぎる文字列でエラーをスローすること", () => {
      const longString = "a".repeat(101);
      expect(() => CollectionName.of(longString)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = CollectionName.tryOf("My Favorites");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("My Favorites");
      }
    });

    it("空の文字列でエラーを返すこと", () => {
      const result = CollectionName.tryOf("");
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const name1 = CollectionName.of("Date Night");
      const name2 = CollectionName.of("Date Night");
      expect(name1.equals(name2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const name1 = CollectionName.of("Date Night");
      const name2 = CollectionName.of("Coffee Shops");
      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const name = CollectionName.of("Date Night");
      expect(name.toString()).toBe("Date Night");
    });
  });
});
