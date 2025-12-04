import { Place, PlaceDetailsCache } from "../../domain/entities";
import {
  PlaceId,
  Latitude,
  Longitude,
  Rating,
  PriceLevel,
  CategoryTag,
} from "../../domain/value-object";
import { UserId } from "../../domain/value-object/user";
import { IPlaceRepository } from "../../infrastructure/repository/PlaceRepository";
import { IUserActionRepository } from "../../infrastructure/repository/UserActionRepository";
import {
  IGooglePlacesService,
  GooglePlaceResult,
  priceLevelToNumber,
} from "../../infrastructure/service/GooglePlacesService";

export type SearchPlacesNearbyInput = {
  userId: string;
  latitude: number;
  longitude: number;
  radius?: number;
  type?: string;
  keyword?: string;
  limit?: number;
};

export type SearchPlaceResult = {
  placeId: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  cachedImageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  priceLevel: number | null;
  categoryTag: string | null;
};

export type SearchPlacesNearbyOutput = {
  places: SearchPlaceResult[];
  totalCount: number;
};

export class SearchPlacesNearbyUseCase {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly userActionRepository: IUserActionRepository,
    private readonly googlePlacesService: IGooglePlacesService
  ) {}

  async invoke(
    input: SearchPlacesNearbyInput
  ): Promise<SearchPlacesNearbyOutput> {
    const {
      userId,
      latitude,
      longitude,
      radius = 1000,
      type,
      keyword,
      limit = 20,
    } = input;

    const nopedPlaceIds = await this.userActionRepository.findNopedPlaceIds(
      UserId.of(userId)
    );
    const nopedPlaceIdSet = new Set(nopedPlaceIds.map((p) => p.value));

    const includedTypes = type ? [type] : undefined;

    let googleResults: GooglePlaceResult[];

    if (keyword) {
      const response = await this.googlePlacesService.textSearch({
        textQuery: keyword,
        latitude,
        longitude,
        radius,
        includedType: type,
        maxResultCount: limit,
      });
      googleResults = response.places;
    } else {
      const response = await this.googlePlacesService.nearbySearch({
        latitude,
        longitude,
        radius,
        includedTypes,
        maxResultCount: limit,
      });
      googleResults = response.places;
    }

    const filteredResults = googleResults.filter(
      (place) => !nopedPlaceIdSet.has(place.id)
    );

    const places: SearchPlaceResult[] = [];

    for (const googlePlace of filteredResults) {
      const placeId = PlaceId.of(googlePlace.id);
      const lat = Latitude.of(googlePlace.location.latitude);
      const lng = Longitude.of(googlePlace.location.longitude);

      const place = Place.of(placeId, lat, lng);

      // Google Places APIのphoto reference（photo name）のみを保存
      // 画像URLは都度APIから取得する（規約準拠のため）
      const photoReference = googlePlace.photos?.[0]?.name ?? null;

      const priceLevel = priceLevelToNumber(googlePlace.priceLevel);
      const details = PlaceDetailsCache.of(
        placeId,
        googlePlace.displayName.text,
        googlePlace.formattedAddress ?? null,
        photoReference,
        googlePlace.rating ? Rating.of(googlePlace.rating) : null,
        googlePlace.userRatingCount ?? null,
        priceLevel !== null ? PriceLevel.of(priceLevel) : null,
        googlePlace.primaryTypeDisplayName?.text
          ? CategoryTag.of(googlePlace.primaryTypeDisplayName.text)
          : null,
        new Date()
      );

      await this.placeRepository.upsertWithDetails(place, details);

      // 画像URLは都度APIから取得する（規約準拠のため）
      const imageUrl = photoReference
        ? this.googlePlacesService.getPhotoUrl(photoReference)
        : null;

      places.push({
        placeId: googlePlace.id,
        name: googlePlace.displayName.text,
        address: googlePlace.formattedAddress ?? null,
        latitude: googlePlace.location.latitude,
        longitude: googlePlace.location.longitude,
        cachedImageUrl: imageUrl,
        rating: googlePlace.rating ?? null,
        reviewCount: googlePlace.userRatingCount ?? null,
        priceLevel,
        categoryTag: googlePlace.primaryTypeDisplayName?.text ?? null,
      });
    }

    return {
      places,
      totalCount: places.length,
    };
  }
}
