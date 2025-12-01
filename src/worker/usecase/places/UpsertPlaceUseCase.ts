import { IPlaceRepository } from "../../infrastructure/repository/PlaceRepository";
import { Place, PlaceDetailsCache } from "../../domain/entities";
import {
  PlaceId,
  Latitude,
  Longitude,
  Rating,
  PriceLevel,
  CategoryTag,
} from "../../domain/value-object";

export type UpsertPlaceInput = {
  placeId: string;
  latitude: number;
  longitude: number;
  details?: {
    name: string;
    address?: string | null;
    cachedImageUrl?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    priceLevel?: number | null;
    categoryTag?: string | null;
    rawJson?: string | null;
  };
};

export type UpsertPlaceOutput = {
  place: Place;
  details: PlaceDetailsCache | null;
  isNew: boolean;
};

export class UpsertPlaceUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async invoke(input: UpsertPlaceInput): Promise<UpsertPlaceOutput> {
    const placeId = PlaceId.of(input.placeId);

    const existing = await this.placeRepository.findById(placeId);
    const isNew = existing === null;

    const place = Place.of(
      placeId,
      Latitude.of(input.latitude),
      Longitude.of(input.longitude),
      existing?.createdAt ?? new Date()
    );

    if (input.details) {
      const details = PlaceDetailsCache.of(
        placeId,
        input.details.name,
        input.details.address ?? null,
        input.details.cachedImageUrl ?? null,
        input.details.rating != null ? Rating.of(input.details.rating) : null,
        input.details.reviewCount ?? null,
        input.details.priceLevel != null
          ? PriceLevel.of(input.details.priceLevel)
          : null,
        input.details.categoryTag != null
          ? CategoryTag.of(input.details.categoryTag)
          : null,
        input.details.rawJson ?? null,
        new Date()
      );

      const { place: placeResult, details: detailsResult } =
        await this.placeRepository.upsertWithDetails(place, details);

      return { place: placeResult, details: detailsResult, isNew };
    } else {
      const placeResult = await this.placeRepository.upsert(place);
      return { place: placeResult, details: null, isNew };
    }
  }
}
