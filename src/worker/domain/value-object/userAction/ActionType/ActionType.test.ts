import { describe, it, expect } from "vitest";
import { ActionType } from "./ActionType";

describe("ActionType", () => {
  describe("of", () => {
    it("LIKE を作成できること", () => {
      const type = ActionType.of("LIKE");
      expect(type.value).toBe("LIKE");
    });

    it("NOPE を作成できること", () => {
      const type = ActionType.of("NOPE");
      expect(type.value).toBe("NOPE");
    });

    it("VIEW を作成できること", () => {
      const type = ActionType.of("VIEW");
      expect(type.value).toBe("VIEW");
    });

    it("無効な値でエラーをスローすること", () => {
      expect(() => ActionType.of("INVALID")).toThrow();
      expect(() => ActionType.of("like")).toThrow();
      expect(() => ActionType.of("")).toThrow();
    });
  });

  describe("static factory methods", () => {
    it("LIKE() が正しく動作すること", () => {
      const type = ActionType.LIKE();
      expect(type.value).toBe("LIKE");
      expect(type.isLike()).toBe(true);
    });

    it("NOPE() が正しく動作すること", () => {
      const type = ActionType.NOPE();
      expect(type.value).toBe("NOPE");
      expect(type.isNope()).toBe(true);
    });

    it("VIEW() が正しく動作すること", () => {
      const type = ActionType.VIEW();
      expect(type.value).toBe("VIEW");
      expect(type.isView()).toBe(true);
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = ActionType.tryOf("LIKE");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("LIKE");
      }
    });

    it("無効な値でエラーを返すこと", () => {
      const result = ActionType.tryOf("INVALID");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking methods", () => {
    it("isLike() が正しく判定すること", () => {
      expect(ActionType.of("LIKE").isLike()).toBe(true);
      expect(ActionType.of("NOPE").isLike()).toBe(false);
      expect(ActionType.of("VIEW").isLike()).toBe(false);
    });

    it("isNope() が正しく判定すること", () => {
      expect(ActionType.of("LIKE").isNope()).toBe(false);
      expect(ActionType.of("NOPE").isNope()).toBe(true);
      expect(ActionType.of("VIEW").isNope()).toBe(false);
    });

    it("isView() が正しく判定すること", () => {
      expect(ActionType.of("LIKE").isView()).toBe(false);
      expect(ActionType.of("NOPE").isView()).toBe(false);
      expect(ActionType.of("VIEW").isView()).toBe(true);
    });
  });

  describe("equals", () => {
    it("同じ値で true を返すこと", () => {
      const type1 = ActionType.of("LIKE");
      const type2 = ActionType.of("LIKE");
      expect(type1.equals(type2)).toBe(true);
    });

    it("異なる値で false を返すこと", () => {
      const type1 = ActionType.of("LIKE");
      const type2 = ActionType.of("NOPE");
      expect(type1.equals(type2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列を返すこと", () => {
      const type = ActionType.of("LIKE");
      expect(type.toString()).toBe("LIKE");
    });
  });
});
