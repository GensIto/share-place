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
  priceLevelToNumber,
} from "../../infrastructure/service/GooglePlacesService";
import { IGeminiService } from "../../infrastructure/service/GeminiService";

export type SearchPlacesWithAiInput = {
  userId: string;
  query: string;
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
};

export type SearchPlaceWithAiResult = {
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

export type SearchPlacesWithAiOutput = {
  places: SearchPlaceWithAiResult[];
  totalCount: number;
};

export class SearchPlacesWithAiUseCase {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly userActionRepository: IUserActionRepository,
    private readonly googlePlacesService: IGooglePlacesService,
    private readonly geminiService: IGeminiService
  ) {}

  async invoke(
    input: SearchPlacesWithAiInput
  ): Promise<SearchPlacesWithAiOutput> {
    const {
      userId,
      query,
      latitude,
      longitude,
      radius = 5000,
      limit = 20,
    } = input;

    const nopedPlaceIds = await this.userActionRepository.findNopedPlaceIds(
      UserId.of(userId)
    );
    const nopedPlaceIdSet = new Set(nopedPlaceIds.map((p) => p.value));

    const extractedParams = await this.geminiService.extractSearchParams(query);

    const searchQuery = [
      ...extractedParams.searchKeywords,
      ...extractedParams.vibeKeywords,
    ].join(" ");

    const includedType = extractedParams.placeTypes[0];

    const response = await this.googlePlacesService.textSearch({
      textQuery: searchQuery || query,
      latitude,
      longitude,
      radius,
      includedType,
      maxResultCount: limit,
    });

    const filteredResults = response.places.filter(
      (place) => !nopedPlaceIdSet.has(place.id)
    );

    const places: SearchPlaceWithAiResult[] = [];

    for (const googlePlace of filteredResults) {
      const placeId = PlaceId.of(googlePlace.id);
      const lat = Latitude.of(googlePlace.location.latitude);
      const lng = Longitude.of(googlePlace.location.longitude);

      const place = Place.of(placeId, lat, lng);

      const photoUrl = googlePlace.photos?.[0]
        ? this.googlePlacesService.getPhotoUrl(googlePlace.photos[0].name)
        : null;

      const priceLevel = priceLevelToNumber(googlePlace.priceLevel);
      const details = PlaceDetailsCache.of(
        placeId,
        googlePlace.displayName.text,
        googlePlace.formattedAddress ?? null,
        photoUrl,
        googlePlace.rating ? Rating.of(googlePlace.rating) : null,
        googlePlace.userRatingCount ?? null,
        priceLevel !== null ? PriceLevel.of(priceLevel) : null,
        googlePlace.primaryTypeDisplayName?.text
          ? CategoryTag.of(googlePlace.primaryTypeDisplayName.text)
          : null,
        JSON.stringify(googlePlace),
        new Date()
      );

      await this.placeRepository.upsertWithDetails(place, details);

      places.push({
        placeId: googlePlace.id,
        name: googlePlace.displayName.text,
        address: googlePlace.formattedAddress ?? null,
        latitude: googlePlace.location.latitude,
        longitude: googlePlace.location.longitude,
        cachedImageUrl: photoUrl,
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
