import { describe, it, expect } from "vitest";
import { SharedPackItemId } from "./SharedPackItemId";

describe("SharedPackItemId", () => {
  describe("of", () => {
    it("有効なSharedPackItemIdを作成できること", () => {
      const id = SharedPackItemId.of(1);
      expect(id.value).toBe(1);
    });

    it("0以下でエラーをスローすること", () => {
      expect(() => SharedPackItemId.of(0)).toThrow();
      expect(() => SharedPackItemId.of(-1)).toThrow();
    });

    it("小数でエラーをスローすること", () => {
      expect(() => SharedPackItemId.of(1.5)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = SharedPackItemId.tryOf(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(1);
      }
    });

    it("無効な値でエラーを返すこと", () => {
      const result = SharedPackItemId.tryOf(0);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const id1 = SharedPackItemId.of(1);
      const id2 = SharedPackItemId.of(1);
      expect(id1.equals(id2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const id1 = SharedPackItemId.of(1);
      const id2 = SharedPackItemId.of(2);
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const id = SharedPackItemId.of(42);
      expect(id.toString()).toBe("42");
    });
  });
});
