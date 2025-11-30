import { describe, it, expect } from "vitest";
import { PriceLevel } from "./PriceLevel";

describe("PriceLevel", () => {
  describe("of", () => {
    it("有効な価格レベルを作成できること", () => {
      const priceLevel = PriceLevel.of(2);
      expect(priceLevel.value).toBe(2);
    });

    it("境界値 0 で作成できること", () => {
      const priceLevel = PriceLevel.of(0);
      expect(priceLevel.value).toBe(0);
    });

    it("境界値 4 で作成できること", () => {
      const priceLevel = PriceLevel.of(4);
      expect(priceLevel.value).toBe(4);
    });

    it("負の値でエラーをスローすること", () => {
      expect(() => PriceLevel.of(-1)).toThrow();
    });

    it("4 を超えるとエラーをスローすること", () => {
      expect(() => PriceLevel.of(5)).toThrow();
    });

    it("小数でエラーをスローすること", () => {
      expect(() => PriceLevel.of(2.5)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な価格レベルで成功を返すこと", () => {
      const result = PriceLevel.tryOf(2);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(2);
      }
    });

    it("無効な価格レベルでエラーを返すこと", () => {
      const result = PriceLevel.tryOf(5);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const level1 = PriceLevel.of(2);
      const level2 = PriceLevel.of(2);
      expect(level1.equals(level2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const level1 = PriceLevel.of(2);
      const level2 = PriceLevel.of(3);
      expect(level1.equals(level2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const priceLevel = PriceLevel.of(2);
      expect(priceLevel.toString()).toBe("2");
    });
  });
});
