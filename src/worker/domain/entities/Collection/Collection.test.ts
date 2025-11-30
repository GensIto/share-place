import { describe, it, expect } from "vitest";
import { Collection } from "./Collection";
import { UserId } from "../../value-object/user";
import {
  CollectionId,
  CollectionName,
  DisplayOrder,
} from "../../value-object/collection";

describe("Collection", () => {
  const validCollectionId = CollectionId.of("11111111-1111-4111-8111-111111111111");
  const validUserId = UserId.of("22222222-2222-4222-8222-222222222222");
  const validName = CollectionName.of("Date Night");
  const validIconEmoji = "❤️";
  const validDisplayOrder = DisplayOrder.of(0);
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なCollectionを作成できること", () => {
      const collection = Collection.of(
        validCollectionId,
        validUserId,
        validName,
        validIconEmoji,
        validDisplayOrder,
        true,
        validCreatedAt
      );

      expect(collection.collectionId).toBe(validCollectionId);
      expect(collection.userId).toBe(validUserId);
      expect(collection.name).toBe(validName);
      expect(collection.iconEmoji).toBe(validIconEmoji);
      expect(collection.displayOrder).toBe(validDisplayOrder);
      expect(collection.isDefault).toBe(true);
      expect(collection.createdAt).toBe(validCreatedAt);
    });

    it("デフォルトパラメータで有効なCollectionを作成できること", () => {
      const beforeCreate = new Date();
      const collection = Collection.of(validCollectionId, validUserId, validName);
      const afterCreate = new Date();

      expect(collection.collectionId).toBe(validCollectionId);
      expect(collection.userId).toBe(validUserId);
      expect(collection.name).toBe(validName);
      expect(collection.iconEmoji).toBeNull();
      expect(collection.displayOrder.value).toBe(0);
      expect(collection.isDefault).toBe(false);
      expect(collection.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(collection.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe("tryOf", () => {
    it("有効なCollectionで成功を返すこと", () => {
      const result = Collection.tryOf(
        validCollectionId,
        validUserId,
        validName,
        validIconEmoji,
        validDisplayOrder,
        false,
        validCreatedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.collectionId).toBe(validCollectionId);
        expect(result.value.userId).toBe(validUserId);
        expect(result.value.name).toBe(validName);
      }
    });
  });

  describe("toJson", () => {
    it("CollectionをJSONに変換できること", () => {
      const collection = Collection.of(
        validCollectionId,
        validUserId,
        validName,
        validIconEmoji,
        validDisplayOrder,
        true,
        validCreatedAt
      );

      const json = collection.toJson();

      expect(json).toEqual({
        collectionId: "11111111-1111-4111-8111-111111111111",
        userId: "22222222-2222-4222-8222-222222222222",
        name: "Date Night",
        iconEmoji: "❤️",
        displayOrder: 0,
        isDefault: true,
        createdAt: validCreatedAt.toISOString(),
      });
    });

    it("null値を正しく処理できること", () => {
      const collection = Collection.of(validCollectionId, validUserId, validName);

      const json = collection.toJson();

      expect(json.iconEmoji).toBeNull();
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const collection = Collection.of(
        validCollectionId,
        validUserId,
        validName
      );

      const originalCollectionId = collection.collectionId;
      const originalUserId = collection.userId;
      const originalName = collection.name;

      expect(collection.collectionId).toBe(originalCollectionId);
      expect(collection.userId).toBe(originalUserId);
      expect(collection.name).toBe(originalName);
    });
  });
});
