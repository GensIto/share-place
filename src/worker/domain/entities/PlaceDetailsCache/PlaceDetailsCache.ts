import { z } from "zod";
import { PlaceId, Rating, PriceLevel, CategoryTag } from "../../value-object";

const placeDetailsCacheSchema = z.object({
  placeId: z.custom<PlaceId>(
    (val) => val instanceof PlaceId,
    "Invalid place ID"
  ),
  name: z.string().min(1, "Name cannot be empty"),
  address: z.string().nullable(),
  // Google Places APIのphoto reference（画像URLではなく参照のみ保存）
  // 画像URLは都度APIから取得する（規約準拠のため）
  photoReference: z.string().nullable(),
  rating: z
    .custom<Rating>((val) => val instanceof Rating, "Invalid rating")
    .nullable(),
  reviewCount: z.number().int().min(0).nullable(),
  priceLevel: z
    .custom<PriceLevel>(
      (val) => val instanceof PriceLevel,
      "Invalid price level"
    )
    .nullable(),
  categoryTag: z
    .custom<CategoryTag>(
      (val) => val instanceof CategoryTag,
      "Invalid category tag"
    )
    .nullable(),
  // rawJsonフィールドを削除（Google Maps Platform利用規約に準拠）
  lastFetchedAt: z.date(),
});

export class PlaceDetailsCache {
  private constructor(
    public readonly placeId: PlaceId,
    public readonly name: string,
    public readonly address: string | null,
    public readonly photoReference: string | null,
    public readonly rating: Rating | null,
    public readonly reviewCount: number | null,
    public readonly priceLevel: PriceLevel | null,
    public readonly categoryTag: CategoryTag | null,
    public readonly lastFetchedAt: Date
  ) {}

  static of(
    placeId: PlaceId,
    name: string,
    address: string | null = null,
    photoReference: string | null = null,
    rating: Rating | null = null,
    reviewCount: number | null = null,
    priceLevel: PriceLevel | null = null,
    categoryTag: CategoryTag | null = null,
    lastFetchedAt: Date = new Date()
  ): PlaceDetailsCache {
    const validated = placeDetailsCacheSchema.parse({
      placeId,
      name,
      address,
      photoReference,
      rating,
      reviewCount,
      priceLevel,
      categoryTag,
      lastFetchedAt,
    });
    return new PlaceDetailsCache(
      validated.placeId,
      validated.name,
      validated.address,
      validated.photoReference,
      validated.rating,
      validated.reviewCount,
      validated.priceLevel,
      validated.categoryTag,
      validated.lastFetchedAt
    );
  }

  static tryOf(
    placeId: PlaceId,
    name: string,
    address: string | null = null,
    photoReference: string | null = null,
    rating: Rating | null = null,
    reviewCount: number | null = null,
    priceLevel: PriceLevel | null = null,
    categoryTag: CategoryTag | null = null,
    lastFetchedAt: Date = new Date()
  ):
    | { success: true; value: PlaceDetailsCache }
    | { success: false; error: string } {
    const result = placeDetailsCacheSchema.safeParse({
      placeId,
      name,
      address,
      photoReference,
      rating,
      reviewCount,
      priceLevel,
      categoryTag,
      lastFetchedAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new PlaceDetailsCache(
          result.data.placeId,
          result.data.name,
          result.data.address,
          result.data.photoReference,
          result.data.rating,
          result.data.reviewCount,
          result.data.priceLevel,
          result.data.categoryTag,
          result.data.lastFetchedAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    placeId: string;
    name: string;
    address: string | null;
    photoReference: string | null;
    rating: number | null;
    reviewCount: number | null;
    priceLevel: number | null;
    categoryTag: string | null;
    lastFetchedAt: string;
  } {
    return {
      placeId: this.placeId.value,
      name: this.name,
      address: this.address,
      photoReference: this.photoReference,
      rating: this.rating?.value ?? null,
      reviewCount: this.reviewCount,
      priceLevel: this.priceLevel?.value ?? null,
      categoryTag: this.categoryTag?.value ?? null,
      lastFetchedAt: this.lastFetchedAt.toISOString(),
    };
  }
}
