import { describe, it, expect } from "vitest";
import { PlaceId } from "./PlaceId";

describe("PlaceId", () => {
  describe("of", () => {
    it("有効なPlaceIdを作成できること", () => {
      const placeId = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
      expect(placeId.value).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
    });

    it("空の文字列でエラーをスローすること", () => {
      expect(() => PlaceId.of("")).toThrow();
    });

    it("長すぎる文字列でエラーをスローすること", () => {
      const longString = "a".repeat(256);
      expect(() => PlaceId.of(longString)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なPlaceIdで成功を返すこと", () => {
      const result = PlaceId.tryOf("ChIJN1t_tDeuEmsRUsoyG83frY4");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
      }
    });

    it("空の文字列でエラーを返すこと", () => {
      const result = PlaceId.tryOf("");
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const id1 = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
      const id2 = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
      expect(id1.equals(id2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const id1 = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
      const id2 = PlaceId.of("ChIJabc123");
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const placeId = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
      expect(placeId.toString()).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
    });
  });
});
