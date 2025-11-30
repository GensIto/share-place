import { describe, it, expect } from "vitest";
import { UserActionId } from "./UserActionId";

describe("UserActionId", () => {
  describe("of", () => {
    it("有効なUserActionIdを作成できること", () => {
      const id = UserActionId.of(1);
      expect(id.value).toBe(1);
    });

    it("0以下でエラーをスローすること", () => {
      expect(() => UserActionId.of(0)).toThrow();
      expect(() => UserActionId.of(-1)).toThrow();
    });

    it("小数でエラーをスローすること", () => {
      expect(() => UserActionId.of(1.5)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = UserActionId.tryOf(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(1);
      }
    });

    it("無効な値でエラーを返すこと", () => {
      const result = UserActionId.tryOf(0);
      expect(result.success).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const id1 = UserActionId.of(1);
      const id2 = UserActionId.of(1);
      expect(id1.equals(id2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const id1 = UserActionId.of(1);
      const id2 = UserActionId.of(2);
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const id = UserActionId.of(42);
      expect(id.toString()).toBe("42");
    });
  });
});
