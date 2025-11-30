import { describe, it, expect } from "vitest";
import { PlaceDetailsCache } from "./PlaceDetailsCache";
import { PlaceId, Rating, PriceLevel, CategoryTag } from "../../value-object";

describe("PlaceDetailsCache", () => {
  const validPlaceId = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
  const validName = "Starbucks Coffee";
  const validAddress = "東京都渋谷区1-1-1";
  const validCachedImageUrl = "https://example.com/image.jpg";
  const validRating = Rating.of(4.5);
  const validReviewCount = 100;
  const validPriceLevel = PriceLevel.of(2);
  const validCategoryTag = CategoryTag.of("cafe");
  const validLastFetchedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なPlaceDetailsCacheを作成できること", () => {
      const cache = PlaceDetailsCache.of(
        validPlaceId,
        validName,
        validAddress,
        validCachedImageUrl,
        validRating,
        validReviewCount,
        validPriceLevel,
        validCategoryTag,
        '{"key": "value"}',
        validLastFetchedAt
      );

      expect(cache.placeId).toBe(validPlaceId);
      expect(cache.name).toBe(validName);
      expect(cache.address).toBe(validAddress);
      expect(cache.cachedImageUrl).toBe(validCachedImageUrl);
      expect(cache.rating).toBe(validRating);
      expect(cache.reviewCount).toBe(validReviewCount);
      expect(cache.priceLevel).toBe(validPriceLevel);
      expect(cache.categoryTag).toBe(validCategoryTag);
      expect(cache.rawJson).toBe('{"key": "value"}');
      expect(cache.lastFetchedAt).toBe(validLastFetchedAt);
    });

    it("最小パラメータで有効なPlaceDetailsCacheを作成できること", () => {
      const beforeCreate = new Date();
      const cache = PlaceDetailsCache.of(validPlaceId, validName);
      const afterCreate = new Date();

      expect(cache.placeId).toBe(validPlaceId);
      expect(cache.name).toBe(validName);
      expect(cache.address).toBeNull();
      expect(cache.cachedImageUrl).toBeNull();
      expect(cache.rating).toBeNull();
      expect(cache.reviewCount).toBeNull();
      expect(cache.priceLevel).toBeNull();
      expect(cache.categoryTag).toBeNull();
      expect(cache.rawJson).toBeNull();
      expect(cache.lastFetchedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(cache.lastFetchedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it("空の名前でエラーをスローすること", () => {
      expect(() => PlaceDetailsCache.of(validPlaceId, "")).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なPlaceDetailsCacheで成功を返すこと", () => {
      const result = PlaceDetailsCache.tryOf(
        validPlaceId,
        validName,
        validAddress,
        validCachedImageUrl,
        validRating,
        validReviewCount,
        validPriceLevel,
        validCategoryTag,
        null,
        validLastFetchedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.placeId).toBe(validPlaceId);
        expect(result.value.name).toBe(validName);
      }
    });
  });

  describe("toJson", () => {
    it("PlaceDetailsCacheをJSONに変換できること", () => {
      const cache = PlaceDetailsCache.of(
        validPlaceId,
        validName,
        validAddress,
        validCachedImageUrl,
        validRating,
        validReviewCount,
        validPriceLevel,
        validCategoryTag,
        null,
        validLastFetchedAt
      );

      const json = cache.toJson();

      expect(json).toEqual({
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        name: validName,
        address: validAddress,
        cachedImageUrl: validCachedImageUrl,
        rating: 4.5,
        reviewCount: 100,
        priceLevel: 2,
        categoryTag: "cafe",
        rawJson: null,
        lastFetchedAt: validLastFetchedAt.toISOString(),
      });
    });

    it("null値を正しく処理できること", () => {
      const cache = PlaceDetailsCache.of(validPlaceId, validName);

      const json = cache.toJson();

      expect(json.address).toBeNull();
      expect(json.cachedImageUrl).toBeNull();
      expect(json.rating).toBeNull();
      expect(json.reviewCount).toBeNull();
      expect(json.priceLevel).toBeNull();
      expect(json.categoryTag).toBeNull();
      expect(json.rawJson).toBeNull();
    });
  });
});
