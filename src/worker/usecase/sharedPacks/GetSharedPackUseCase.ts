import { HTTPException } from "hono/http-exception";
import { ISharedPackRepository } from "../../infrastructure/repository/SharedPackRepository";
import { ShareToken } from "../../domain/value-object/sharedPack";

export type GetSharedPackOutput = {
  shareToken: string;
  title: string;
  message: string | null;
  creator: {
    userId: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
  items: Array<{
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
    publicComment: string | null;
    sortOrder: number;
  }>;
  itemCount: number;
};

export class GetSharedPackUseCase {
  constructor(private readonly sharedPackRepository: ISharedPackRepository) {}

  async invoke(shareTokenValue: string): Promise<GetSharedPackOutput> {
    const shareToken = ShareToken.of(shareTokenValue);

    const result = await this.sharedPackRepository.findByShareToken(shareToken);

    if (!result) {
      throw new HTTPException(404, {
        message: "共有パックが見つかりません",
      });
    }

    return {
      shareToken: result.sharedPack.shareToken.value,
      title: result.sharedPack.title.value,
      message: result.sharedPack.message,
      creator: result.creator,
      createdAt: result.sharedPack.createdAt.toISOString(),
      items: result.items
        .filter((item) => item.placeDetails !== null)
        .map((item) => ({
          placeId: item.placeId,
          name: item.placeDetails!.name,
          address: item.placeDetails!.address,
          latitude: item.placeDetails!.latitude,
          longitude: item.placeDetails!.longitude,
          cachedImageUrl: item.placeDetails!.cachedImageUrl,
          rating: item.placeDetails!.rating,
          reviewCount: item.placeDetails!.reviewCount,
          priceLevel: item.placeDetails!.priceLevel,
          categoryTag: item.placeDetails!.categoryTag,
          publicComment: item.publicComment,
          sortOrder: item.sortOrder,
        })),
      itemCount: result.items.length,
    };
  }
}
