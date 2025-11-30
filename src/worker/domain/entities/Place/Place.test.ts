import { describe, it, expect } from "vitest";
import { Place } from "./Place";
import { PlaceId, Latitude, Longitude } from "../../value-object";

describe("Place", () => {
  const validPlaceId = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
  const validLatitude = Latitude.of(35.6762);
  const validLongitude = Longitude.of(139.6503);
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なPlaceエンティティを作成できること", () => {
      const place = Place.of(
        validPlaceId,
        validLatitude,
        validLongitude,
        validCreatedAt
      );

      expect(place.placeId).toBe(validPlaceId);
      expect(place.latitude).toBe(validLatitude);
      expect(place.longitude).toBe(validLongitude);
      expect(place.createdAt).toBe(validCreatedAt);
    });

    it("デフォルトパラメータで有効なPlaceエンティティを作成できること", () => {
      const beforeCreate = new Date();
      const place = Place.of(validPlaceId, validLatitude, validLongitude);
      const afterCreate = new Date();

      expect(place.placeId).toBe(validPlaceId);
      expect(place.latitude).toBe(validLatitude);
      expect(place.longitude).toBe(validLongitude);
      expect(place.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(place.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe("tryOf", () => {
    it("有効なPlaceで成功を返すこと", () => {
      const result = Place.tryOf(
        validPlaceId,
        validLatitude,
        validLongitude,
        validCreatedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.placeId).toBe(validPlaceId);
        expect(result.value.latitude).toBe(validLatitude);
        expect(result.value.longitude).toBe(validLongitude);
      }
    });

    it("デフォルトパラメータで成功を返すこと", () => {
      const result = Place.tryOf(validPlaceId, validLatitude, validLongitude);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.placeId).toBe(validPlaceId);
      }
    });
  });

  describe("toJson", () => {
    it("PlaceをJSONに変換できること", () => {
      const place = Place.of(
        validPlaceId,
        validLatitude,
        validLongitude,
        validCreatedAt
      );

      const json = place.toJson();

      expect(json).toEqual({
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        latitude: 35.6762,
        longitude: 139.6503,
        createdAt: validCreatedAt.toISOString(),
      });
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const place = Place.of(validPlaceId, validLatitude, validLongitude);

      const originalPlaceId = place.placeId;
      const originalLatitude = place.latitude;
      const originalLongitude = place.longitude;

      expect(place.placeId).toBe(originalPlaceId);
      expect(place.latitude).toBe(originalLatitude);
      expect(place.longitude).toBe(originalLongitude);
    });
  });
});
