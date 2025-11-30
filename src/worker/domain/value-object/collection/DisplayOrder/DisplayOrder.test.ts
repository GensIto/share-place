import { describe, it, expect } from "vitest";
import { DisplayOrder } from "./DisplayOrder";

describe("DisplayOrder", () => {
  describe("of", () => {
    it("有効なDisplayOrderを作成できること", () => {
      const order = DisplayOrder.of(0);
      expect(order.value).toBe(0);
    });

    it("正の整数を作成できること", () => {
      const order = DisplayOrder.of(10);
      expect(order.value).toBe(10);
    });

    it("負の値でエラーをスローすること", () => {
      expect(() => DisplayOrder.of(-1)).toThrow();
    });

    it("小数でエラーをスローすること", () => {
      expect(() => DisplayOrder.of(1.5)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = DisplayOrder.tryOf(5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(5);
      }
    });

    it("負の値でエラーを返すこと", () => {
      const result = DisplayOrder.tryOf(-1);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const order1 = DisplayOrder.of(5);
      const order2 = DisplayOrder.of(5);
      expect(order1.equals(order2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const order1 = DisplayOrder.of(5);
      const order2 = DisplayOrder.of(10);
      expect(order1.equals(order2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const order = DisplayOrder.of(5);
      expect(order.toString()).toBe("5");
    });
  });
});
