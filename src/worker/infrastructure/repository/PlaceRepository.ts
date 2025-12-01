import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { places, placeDetailsCache } from "../../db/places";
import { Place, PlaceDetailsCache } from "../../domain/entities";
import {
  PlaceId,
  Latitude,
  Longitude,
  Rating,
  PriceLevel,
  CategoryTag,
} from "../../domain/value-object";
import * as schema from "../../db/schema";

export interface IPlaceRepository {
  findById(placeId: PlaceId): Promise<Place | null>;
  findByIdWithDetails(
    placeId: PlaceId
  ): Promise<{ place: Place; details: PlaceDetailsCache | null } | null>;
  upsert(place: Place): Promise<Place>;
  upsertDetails(details: PlaceDetailsCache): Promise<PlaceDetailsCache>;
  upsertWithDetails(
    place: Place,
    details: PlaceDetailsCache
  ): Promise<{ place: Place; details: PlaceDetailsCache }>;
}

export class PlaceRepository implements IPlaceRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  async findById(placeId: PlaceId): Promise<Place | null> {
    const result = await this.db
      .select()
      .from(places)
      .where(eq(places.placeId, placeId.value))
      .get();

    if (!result) {
      return null;
    }

    return Place.of(
      PlaceId.of(result.placeId),
      Latitude.of(result.latitude),
      Longitude.of(result.longitude),
      result.createdAt
    );
  }

  async findByIdWithDetails(
    placeId: PlaceId
  ): Promise<{ place: Place; details: PlaceDetailsCache | null } | null> {
    const result = await this.db
      .select()
      .from(places)
      .leftJoin(
        placeDetailsCache,
        eq(places.placeId, placeDetailsCache.placeId)
      )
      .where(eq(places.placeId, placeId.value))
      .get();

    if (!result) {
      return null;
    }

    const place = Place.of(
      PlaceId.of(result.places.placeId),
      Latitude.of(result.places.latitude),
      Longitude.of(result.places.longitude),
      result.places.createdAt
    );

    if (!result.place_details_cache) {
      return { place, details: null };
    }

    const details = PlaceDetailsCache.of(
      PlaceId.of(result.place_details_cache.placeId),
      result.place_details_cache.name,
      result.place_details_cache.address,
      result.place_details_cache.cachedImageUrl,
      result.place_details_cache.rating != null
        ? Rating.of(result.place_details_cache.rating)
        : null,
      result.place_details_cache.reviewCount,
      result.place_details_cache.priceLevel != null
        ? PriceLevel.of(result.place_details_cache.priceLevel)
        : null,
      result.place_details_cache.categoryTag != null
        ? CategoryTag.of(result.place_details_cache.categoryTag)
        : null,
      result.place_details_cache.rawJson,
      result.place_details_cache.lastFetchedAt
    );

    return { place, details };
  }

  async upsert(place: Place): Promise<Place> {
    const result = await this.db
      .insert(places)
      .values({
        placeId: place.placeId.value,
        latitude: place.latitude.value,
        longitude: place.longitude.value,
        createdAt: place.createdAt,
      })
      .onConflictDoUpdate({
        target: places.placeId,
        set: {
          latitude: place.latitude.value,
          longitude: place.longitude.value,
        },
      })
      .returning()
      .get();

    return Place.of(
      PlaceId.of(result.placeId),
      Latitude.of(result.latitude),
      Longitude.of(result.longitude),
      result.createdAt
    );
  }

  async upsertDetails(details: PlaceDetailsCache): Promise<PlaceDetailsCache> {
    const result = await this.db
      .insert(placeDetailsCache)
      .values({
        placeId: details.placeId.value,
        name: details.name,
        address: details.address,
        cachedImageUrl: details.cachedImageUrl,
        rating: details.rating?.value ?? null,
        reviewCount: details.reviewCount,
        priceLevel: details.priceLevel?.value ?? null,
        categoryTag: details.categoryTag?.value ?? null,
        rawJson: details.rawJson,
        lastFetchedAt: details.lastFetchedAt,
      })
      .onConflictDoUpdate({
        target: placeDetailsCache.placeId,
        set: {
          name: details.name,
          address: details.address,
          cachedImageUrl: details.cachedImageUrl,
          rating: details.rating?.value ?? null,
          reviewCount: details.reviewCount,
          priceLevel: details.priceLevel?.value ?? null,
          categoryTag: details.categoryTag?.value ?? null,
          rawJson: details.rawJson,
          lastFetchedAt: details.lastFetchedAt,
        },
      })
      .returning()
      .get();

    if (!result) {
      throw new Error("Failed to upsert details");
    }

    return PlaceDetailsCache.of(
      PlaceId.of(result.placeId),
      result.name,
      result.address,
      result.cachedImageUrl,
      result.rating != null ? Rating.of(result.rating) : null,
      result.reviewCount,
      result.priceLevel != null ? PriceLevel.of(result.priceLevel) : null,
      result.categoryTag != null ? CategoryTag.of(result.categoryTag) : null,
      result.rawJson,
      result.lastFetchedAt
    );
  }

  async upsertWithDetails(
    place: Place,
    details: PlaceDetailsCache
  ): Promise<{ place: Place; details: PlaceDetailsCache }> {
    const [placeResult, detailsResult] = await Promise.all([
      this.upsert(place),
      this.upsertDetails(details),
    ]);

    return { place: placeResult, details: detailsResult };
  }
}
