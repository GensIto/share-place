import { describe, it, expect } from "vitest";
import { ShareToken } from "./ShareToken";

describe("ShareToken", () => {
  describe("of", () => {
    it("有効なShareTokenを作成できること", () => {
      const token = ShareToken.of("abc12345");
      expect(token.value).toBe("abc12345");
    });

    it("空の文字列でエラーをスローすること", () => {
      expect(() => ShareToken.of("")).toThrow();
    });

    it("長すぎる文字列でエラーをスローすること", () => {
      const longString = "a".repeat(65);
      expect(() => ShareToken.of(longString)).toThrow();
    });

    it("英数字以外の文字でエラーをスローすること", () => {
      expect(() => ShareToken.of("abc-123")).toThrow();
      expect(() => ShareToken.of("abc_123")).toThrow();
      expect(() => ShareToken.of("abc 123")).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = ShareToken.tryOf("xyz789");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("xyz789");
      }
    });

    it("無効な値でエラーを返すこと", () => {
      const result = ShareToken.tryOf("invalid-token");
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const token1 = ShareToken.of("abc123");
      const token2 = ShareToken.of("abc123");
      expect(token1.equals(token2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const token1 = ShareToken.of("abc123");
      const token2 = ShareToken.of("xyz789");
      expect(token1.equals(token2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const token = ShareToken.of("abc12345");
      expect(token.toString()).toBe("abc12345");
    });
  });
});
