import { describe, it, expect } from "vitest";
import { CollectionItem } from "./CollectionItem";
import { CollectionId, CollectionItemId } from "../../value-object/collection";
import { PlaceId } from "../../value-object/place";
import { ShareToken } from "../../value-object/sharedPack";

describe("CollectionItem", () => {
  const validCollectionItemId = CollectionItemId.of(1);
  const validCollectionId = CollectionId.of("11111111-1111-4111-8111-111111111111");
  const validPlaceId = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
  const validUserMemo = "とても美味しいカフェ";
  const validSourceShareToken = ShareToken.of("abc12345");
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なCollectionItemを作成できること", () => {
      const item = CollectionItem.of(
        validCollectionItemId,
        validCollectionId,
        validPlaceId,
        validUserMemo,
        validSourceShareToken,
        validCreatedAt
      );

      expect(item.collectionItemId).toBe(validCollectionItemId);
      expect(item.collectionId).toBe(validCollectionId);
      expect(item.placeId).toBe(validPlaceId);
      expect(item.userMemo).toBe(validUserMemo);
      expect(item.sourceShareToken).toBe(validSourceShareToken);
      expect(item.createdAt).toBe(validCreatedAt);
    });

    it("デフォルトパラメータで有効なCollectionItemを作成できること", () => {
      const beforeCreate = new Date();
      const item = CollectionItem.of(
        validCollectionItemId,
        validCollectionId,
        validPlaceId
      );
      const afterCreate = new Date();

      expect(item.collectionItemId).toBe(validCollectionItemId);
      expect(item.collectionId).toBe(validCollectionId);
      expect(item.placeId).toBe(validPlaceId);
      expect(item.userMemo).toBeNull();
      expect(item.sourceShareToken).toBeNull();
      expect(item.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(item.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe("tryOf", () => {
    it("有効なCollectionItemで成功を返すこと", () => {
      const result = CollectionItem.tryOf(
        validCollectionItemId,
        validCollectionId,
        validPlaceId,
        validUserMemo,
        validSourceShareToken,
        validCreatedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.collectionItemId).toBe(validCollectionItemId);
        expect(result.value.collectionId).toBe(validCollectionId);
        expect(result.value.placeId).toBe(validPlaceId);
      }
    });
  });

  describe("toJson", () => {
    it("CollectionItemをJSONに変換できること", () => {
      const item = CollectionItem.of(
        validCollectionItemId,
        validCollectionId,
        validPlaceId,
        validUserMemo,
        validSourceShareToken,
        validCreatedAt
      );

      const json = item.toJson();

      expect(json).toEqual({
        collectionItemId: 1,
        collectionId: "11111111-1111-4111-8111-111111111111",
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        userMemo: "とても美味しいカフェ",
        sourceShareToken: "abc12345",
        createdAt: validCreatedAt.toISOString(),
      });
    });

    it("null値を正しく処理できること", () => {
      const item = CollectionItem.of(
        validCollectionItemId,
        validCollectionId,
        validPlaceId
      );

      const json = item.toJson();

      expect(json.userMemo).toBeNull();
      expect(json.sourceShareToken).toBeNull();
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const item = CollectionItem.of(
        validCollectionItemId,
        validCollectionId,
        validPlaceId
      );

      const originalCollectionItemId = item.collectionItemId;
      const originalCollectionId = item.collectionId;
      const originalPlaceId = item.placeId;

      expect(item.collectionItemId).toBe(originalCollectionItemId);
      expect(item.collectionId).toBe(originalCollectionId);
      expect(item.placeId).toBe(originalPlaceId);
    });
  });
});
