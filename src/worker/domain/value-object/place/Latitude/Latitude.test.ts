import { describe, it, expect } from "vitest";
import { Latitude } from "./Latitude";

describe("Latitude", () => {
  describe("of", () => {
    it("有効な緯度を作成できること", () => {
      const latitude = Latitude.of(35.6762);
      expect(latitude.value).toBe(35.6762);
    });

    it("境界値 -90 で作成できること", () => {
      const latitude = Latitude.of(-90);
      expect(latitude.value).toBe(-90);
    });

    it("境界値 90 で作成できること", () => {
      const latitude = Latitude.of(90);
      expect(latitude.value).toBe(90);
    });

    it("-90 未満でエラーをスローすること", () => {
      expect(() => Latitude.of(-90.1)).toThrow();
    });

    it("90 を超えるとエラーをスローすること", () => {
      expect(() => Latitude.of(90.1)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な緯度で成功を返すこと", () => {
      const result = Latitude.tryOf(35.6762);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(35.6762);
      }
    });

    it("無効な緯度でエラーを返すこと", () => {
      const result = Latitude.tryOf(100);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const lat1 = Latitude.of(35.6762);
      const lat2 = Latitude.of(35.6762);
      expect(lat1.equals(lat2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const lat1 = Latitude.of(35.6762);
      const lat2 = Latitude.of(34.0522);
      expect(lat1.equals(lat2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const latitude = Latitude.of(35.6762);
      expect(latitude.toString()).toBe("35.6762");
    });
  });
});
