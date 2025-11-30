import { describe, it, expect } from "vitest";
import { Rating } from "./Rating";

describe("Rating", () => {
  describe("of", () => {
    it("有効な評価を作成できること", () => {
      const rating = Rating.of(4.5);
      expect(rating.value).toBe(4.5);
    });

    it("境界値 1.0 で作成できること", () => {
      const rating = Rating.of(1.0);
      expect(rating.value).toBe(1.0);
    });

    it("境界値 5.0 で作成できること", () => {
      const rating = Rating.of(5.0);
      expect(rating.value).toBe(5.0);
    });

    it("1.0 未満でエラーをスローすること", () => {
      expect(() => Rating.of(0.9)).toThrow();
    });

    it("5.0 を超えるとエラーをスローすること", () => {
      expect(() => Rating.of(5.1)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な評価で成功を返すこと", () => {
      const result = Rating.tryOf(4.5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(4.5);
      }
    });

    it("無効な評価でエラーを返すこと", () => {
      const result = Rating.tryOf(0);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const rating1 = Rating.of(4.5);
      const rating2 = Rating.of(4.5);
      expect(rating1.equals(rating2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const rating1 = Rating.of(4.5);
      const rating2 = Rating.of(3.5);
      expect(rating1.equals(rating2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const rating = Rating.of(4.5);
      expect(rating.toString()).toBe("4.5");
    });
  });
});
