import { describe, it, expect } from "vitest";
import { Longitude } from "./Longitude";

describe("Longitude", () => {
  describe("of", () => {
    it("有効な経度を作成できること", () => {
      const longitude = Longitude.of(139.6503);
      expect(longitude.value).toBe(139.6503);
    });

    it("境界値 -180 で作成できること", () => {
      const longitude = Longitude.of(-180);
      expect(longitude.value).toBe(-180);
    });

    it("境界値 180 で作成できること", () => {
      const longitude = Longitude.of(180);
      expect(longitude.value).toBe(180);
    });

    it("-180 未満でエラーをスローすること", () => {
      expect(() => Longitude.of(-180.1)).toThrow();
    });

    it("180 を超えるとエラーをスローすること", () => {
      expect(() => Longitude.of(180.1)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な経度で成功を返すこと", () => {
      const result = Longitude.tryOf(139.6503);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(139.6503);
      }
    });

    it("無効な経度でエラーを返すこと", () => {
      const result = Longitude.tryOf(200);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const lon1 = Longitude.of(139.6503);
      const lon2 = Longitude.of(139.6503);
      expect(lon1.equals(lon2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const lon1 = Longitude.of(139.6503);
      const lon2 = Longitude.of(-118.2437);
      expect(lon1.equals(lon2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const longitude = Longitude.of(139.6503);
      expect(longitude.toString()).toBe("139.6503");
    });
  });
});
