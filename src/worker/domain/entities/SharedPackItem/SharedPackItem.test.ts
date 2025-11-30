import { describe, it, expect } from "vitest";
import { SharedPackItem } from "./SharedPackItem";
import { PlaceId } from "../../value-object/place";
import {
  ShareToken,
  SharedPackItemId,
  SortOrder,
} from "../../value-object/sharedPack";

describe("SharedPackItem", () => {
  const validSharedPackItemId = SharedPackItemId.of(1);
  const validSharedPackToken = ShareToken.of("abc12345");
  const validPlaceId = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
  const validPublicComment = "ここのコーヒーが最高です！";
  const validSortOrder = SortOrder.of(0);

  describe("of", () => {
    it("すべてのパラメータで有効なSharedPackItemを作成できること", () => {
      const item = SharedPackItem.of(
        validSharedPackItemId,
        validSharedPackToken,
        validPlaceId,
        validPublicComment,
        validSortOrder
      );

      expect(item.sharedPackItemId).toBe(validSharedPackItemId);
      expect(item.sharedPackToken).toBe(validSharedPackToken);
      expect(item.placeId).toBe(validPlaceId);
      expect(item.publicComment).toBe(validPublicComment);
      expect(item.sortOrder).toBe(validSortOrder);
    });

    it("デフォルトパラメータで有効なSharedPackItemを作成できること", () => {
      const item = SharedPackItem.of(
        validSharedPackItemId,
        validSharedPackToken,
        validPlaceId
      );

      expect(item.sharedPackItemId).toBe(validSharedPackItemId);
      expect(item.sharedPackToken).toBe(validSharedPackToken);
      expect(item.placeId).toBe(validPlaceId);
      expect(item.publicComment).toBeNull();
      expect(item.sortOrder.value).toBe(0);
    });
  });

  describe("tryOf", () => {
    it("有効なSharedPackItemで成功を返すこと", () => {
      const result = SharedPackItem.tryOf(
        validSharedPackItemId,
        validSharedPackToken,
        validPlaceId,
        validPublicComment,
        validSortOrder
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.sharedPackItemId).toBe(validSharedPackItemId);
        expect(result.value.sharedPackToken).toBe(validSharedPackToken);
        expect(result.value.placeId).toBe(validPlaceId);
      }
    });
  });

  describe("toJson", () => {
    it("SharedPackItemをJSONに変換できること", () => {
      const item = SharedPackItem.of(
        validSharedPackItemId,
        validSharedPackToken,
        validPlaceId,
        validPublicComment,
        validSortOrder
      );

      const json = item.toJson();

      expect(json).toEqual({
        sharedPackItemId: 1,
        sharedPackToken: "abc12345",
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        publicComment: "ここのコーヒーが最高です！",
        sortOrder: 0,
      });
    });

    it("null値を正しく処理できること", () => {
      const item = SharedPackItem.of(
        validSharedPackItemId,
        validSharedPackToken,
        validPlaceId
      );

      const json = item.toJson();

      expect(json.publicComment).toBeNull();
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const item = SharedPackItem.of(
        validSharedPackItemId,
        validSharedPackToken,
        validPlaceId
      );

      const originalSharedPackItemId = item.sharedPackItemId;
      const originalSharedPackToken = item.sharedPackToken;
      const originalPlaceId = item.placeId;

      expect(item.sharedPackItemId).toBe(originalSharedPackItemId);
      expect(item.sharedPackToken).toBe(originalSharedPackToken);
      expect(item.placeId).toBe(originalPlaceId);
    });
  });
});
