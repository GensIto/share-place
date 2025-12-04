import { IPlaceRepository } from "../../infrastructure/repository/PlaceRepository";
import { Place, PlaceDetailsCache } from "../../domain/entities";
import { PlaceId } from "../../domain/value-object";
import { IGooglePlacesService } from "../../infrastructure/service/GooglePlacesService";

export type GetPlaceDetailOutput = {
  place: Place;
  details: PlaceDetailsCache | null;
  // 画像URLは都度APIから取得（規約準拠のため）
  imageUrl: string | null;
};

export class GetPlaceDetailUseCase {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly googlePlacesService: IGooglePlacesService
  ) {}

  async invoke(placeIdString: string): Promise<GetPlaceDetailOutput | null> {
    const placeId = PlaceId.of(placeIdString);

    const result = await this.placeRepository.findByIdWithDetails(placeId);

    if (!result) {
      return null;
    }

    // photoReferenceから画像URLを生成（規約準拠のため）
    const imageUrl = result.details?.photoReference
      ? this.googlePlacesService.getPhotoUrl(result.details.photoReference)
      : null;

    return {
      place: result.place,
      details: result.details,
      imageUrl,
    };
  }
}
