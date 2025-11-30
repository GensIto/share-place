import { describe, it, expect } from "vitest";
import { Category } from "./Category";
import { CategoryId, CategoryName, CategoryEmoji } from "../../value-object/category";
import { UserId } from "../../value-object/user";
import { DisplayOrder } from "../../value-object/collection";

describe("Category", () => {
  const validCategoryId = CategoryId.of("11111111-1111-4111-8111-111111111111");
  const validUserId = UserId.of("22222222-2222-4222-8222-222222222222");
  const validName = CategoryName.of("カフェ");
  const validEmoji = CategoryEmoji.of("☕");
  const validDisplayOrder = DisplayOrder.of(1);
  const validDate = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("全てのパラメータでCategoryを作成できること", () => {
      const category = Category.of(
        validCategoryId,
        validUserId,
        validName,
        validEmoji,
        validDisplayOrder,
        validDate
      );

      expect(category.categoryId.value).toBe(validCategoryId.value);
      expect(category.userId.value).toBe(validUserId.value);
      expect(category.name.value).toBe("カフェ");
      expect(category.emoji?.value).toBe("☕");
      expect(category.displayOrder.value).toBe(1);
      expect(category.createdAt).toEqual(validDate);
    });

    it("emojiがnullでもCategoryを作成できること", () => {
      const category = Category.of(
        validCategoryId,
        validUserId,
        validName,
        null,
        validDisplayOrder,
        validDate
      );

      expect(category.emoji).toBeNull();
    });

    it("デフォルト値でCategoryを作成できること", () => {
      const category = Category.of(validCategoryId, validUserId, validName);

      expect(category.emoji).toBeNull();
      expect(category.displayOrder.value).toBe(0);
      expect(category.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("tryOf", () => {
    it("有効な値で成功を返すこと", () => {
      const result = Category.tryOf(
        validCategoryId,
        validUserId,
        validName,
        validEmoji
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.name.value).toBe("カフェ");
      }
    });
  });

  describe("toJson", () => {
    it("正しいJSON形式を返すこと", () => {
      const category = Category.of(
        validCategoryId,
        validUserId,
        validName,
        validEmoji,
        validDisplayOrder,
        validDate
      );

      const json = category.toJson();

      expect(json).toEqual({
        categoryId: "11111111-1111-4111-8111-111111111111",
        userId: "22222222-2222-4222-8222-222222222222",
        name: "カフェ",
        emoji: "☕",
        displayOrder: 1,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("emojiがnullの場合もJSONを返すこと", () => {
      const category = Category.of(
        validCategoryId,
        validUserId,
        validName,
        null,
        validDisplayOrder,
        validDate
      );

      const json = category.toJson();

      expect(json.emoji).toBeNull();
    });
  });
});
