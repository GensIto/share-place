import { describe, it, expect } from "vitest";
import { SortOrder } from "./SortOrder";

describe("SortOrder", () => {
  describe("of", () => {
    it("有効なSortOrderを作成できること", () => {
      const order = SortOrder.of(0);
      expect(order.value).toBe(0);
    });

    it("正の整数を作成できること", () => {
      const order = SortOrder.of(10);
      expect(order.value).toBe(10);
    });

    it("負の値でエラーをスローすること", () => {
      expect(() => SortOrder.of(-1)).toThrow();
    });

    it("小数でエラーをスローすること", () => {
      expect(() => SortOrder.of(1.5)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = SortOrder.tryOf(5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(5);
      }
    });

    it("負の値でエラーを返すこと", () => {
      const result = SortOrder.tryOf(-1);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const order1 = SortOrder.of(5);
      const order2 = SortOrder.of(5);
      expect(order1.equals(order2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const order1 = SortOrder.of(5);
      const order2 = SortOrder.of(10);
      expect(order1.equals(order2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const order = SortOrder.of(5);
      expect(order.toString()).toBe("5");
    });
  });
});
