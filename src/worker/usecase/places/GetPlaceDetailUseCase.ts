import { IPlaceRepository } from "../../infrastructure/repository/PlaceRepository";
import { Place, PlaceDetailsCache } from "../../domain/entities";
import { PlaceId } from "../../domain/value-object";

export type GetPlaceDetailOutput = {
  place: Place;
  details: PlaceDetailsCache | null;
};

export class GetPlaceDetailUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async invoke(placeIdString: string): Promise<GetPlaceDetailOutput | null> {
    const placeId = PlaceId.of(placeIdString);

    const result = await this.placeRepository.findByIdWithDetails(placeId);

    if (!result) {
      return null;
    }

    return {
      place: result.place,
      details: result.details,
    };
  }
}
