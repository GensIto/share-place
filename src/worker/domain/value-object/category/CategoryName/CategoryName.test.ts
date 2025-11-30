import { describe, it, expect } from "vitest";
import { CategoryName } from "./CategoryName";

describe("CategoryName", () => {
  describe("of", () => {
    it("有効な名前でCategoryNameを作成できること", () => {
      const name = CategoryName.of("カフェ");
      expect(name.value).toBe("カフェ");
    });

    it("空文字でエラーをスローすること", () => {
      expect(() => CategoryName.of("")).toThrow("Category name cannot be empty");
    });

    it("51文字以上でエラーをスローすること", () => {
      const longName = "a".repeat(51);
      expect(() => CategoryName.of(longName)).toThrow("Category name is too long");
    });

    it("50文字ちょうどで作成できること", () => {
      const name50 = "a".repeat(50);
      const categoryName = CategoryName.of(name50);
      expect(categoryName.value).toBe(name50);
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = CategoryName.tryOf("レストラン");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("レストラン");
      }
    });

    it("空文字でエラーを返すこと", () => {
      const result = CategoryName.tryOf("");
      expect(result.success).toBe(false);
    });

    it("長すぎる名前でエラーを返すこと", () => {
      const result = CategoryName.tryOf("a".repeat(51));
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const name1 = CategoryName.of("カフェ");
      const name2 = CategoryName.of("カフェ");
      expect(name1.equals(name2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const name1 = CategoryName.of("カフェ");
      const name2 = CategoryName.of("レストラン");
      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const name = CategoryName.of("サウナ");
      expect(name.toString()).toBe("サウナ");
    });
  });
});
