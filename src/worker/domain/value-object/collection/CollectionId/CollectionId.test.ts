import { describe, it, expect } from "vitest";
import { CollectionId } from "./CollectionId";

describe("CollectionId", () => {
  const validUuid = "11111111-1111-4111-8111-111111111111";

  describe("of", () => {
    it("有効なUUIDでCollectionIdを作成できること", () => {
      const id = CollectionId.of(validUuid);
      expect(id.value).toBe(validUuid);
    });

    it("無効なUUIDでエラーをスローすること", () => {
      expect(() => CollectionId.of("invalid")).toThrow();
      expect(() => CollectionId.of("")).toThrow();
      expect(() => CollectionId.of("12345")).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = CollectionId.tryOf(validUuid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(validUuid);
      }
    });

    it("無効な値でエラーを返すこと", () => {
      const result = CollectionId.tryOf("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const id1 = CollectionId.of(validUuid);
      const id2 = CollectionId.of(validUuid);
      expect(id1.equals(id2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const id1 = CollectionId.of(validUuid);
      const id2 = CollectionId.of("22222222-2222-4222-8222-222222222222");
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const id = CollectionId.of(validUuid);
      expect(id.toString()).toBe(validUuid);
    });
  });
});
