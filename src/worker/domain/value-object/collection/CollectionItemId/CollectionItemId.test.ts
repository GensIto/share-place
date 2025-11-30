import { describe, it, expect } from "vitest";
import { CollectionItemId } from "./CollectionItemId";

describe("CollectionItemId", () => {
  describe("of", () => {
    it("有効なCollectionItemIdを作成できること", () => {
      const id = CollectionItemId.of(1);
      expect(id.value).toBe(1);
    });

    it("0以下でエラーをスローすること", () => {
      expect(() => CollectionItemId.of(0)).toThrow();
      expect(() => CollectionItemId.of(-1)).toThrow();
    });

    it("小数でエラーをスローすること", () => {
      expect(() => CollectionItemId.of(1.5)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = CollectionItemId.tryOf(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(1);
      }
    });

    it("無効な値でエラーを返すこと", () => {
      const result = CollectionItemId.tryOf(0);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const id1 = CollectionItemId.of(1);
      const id2 = CollectionItemId.of(1);
      expect(id1.equals(id2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const id1 = CollectionItemId.of(1);
      const id2 = CollectionItemId.of(2);
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const id = CollectionItemId.of(42);
      expect(id.toString()).toBe("42");
    });
  });
});
