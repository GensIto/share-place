import { z } from "zod";
import { PlaceId } from "../../value-object/place";
import { ShareToken, SharedPackItemId, SortOrder } from "../../value-object/sharedPack";

const sharedPackItemSchema = z.object({
  sharedPackItemId: z.custom<SharedPackItemId>((val) => val instanceof SharedPackItemId, "Invalid shared pack item ID"),
  sharedPackToken: z.custom<ShareToken>((val) => val instanceof ShareToken, "Invalid share token"),
  placeId: z.custom<PlaceId>((val) => val instanceof PlaceId, "Invalid place ID"),
  publicComment: z.string().nullable(),
  sortOrder: z.custom<SortOrder>((val) => val instanceof SortOrder, "Invalid sort order"),
});

export class SharedPackItem {
  private constructor(
    public readonly sharedPackItemId: SharedPackItemId,
    public readonly sharedPackToken: ShareToken,
    public readonly placeId: PlaceId,
    public readonly publicComment: string | null,
    public readonly sortOrder: SortOrder
  ) {}

  static of(
    sharedPackItemId: SharedPackItemId,
    sharedPackToken: ShareToken,
    placeId: PlaceId,
    publicComment: string | null = null,
    sortOrder: SortOrder = SortOrder.of(0)
  ): SharedPackItem {
    const validated = sharedPackItemSchema.parse({
      sharedPackItemId,
      sharedPackToken,
      placeId,
      publicComment,
      sortOrder,
    });
    return new SharedPackItem(
      validated.sharedPackItemId,
      validated.sharedPackToken,
      validated.placeId,
      validated.publicComment,
      validated.sortOrder
    );
  }

  static tryOf(
    sharedPackItemId: SharedPackItemId,
    sharedPackToken: ShareToken,
    placeId: PlaceId,
    publicComment: string | null = null,
    sortOrder: SortOrder = SortOrder.of(0)
  ): { success: true; value: SharedPackItem } | { success: false; error: string } {
    const result = sharedPackItemSchema.safeParse({
      sharedPackItemId,
      sharedPackToken,
      placeId,
      publicComment,
      sortOrder,
    });
    if (result.success) {
      return {
        success: true,
        value: new SharedPackItem(
          result.data.sharedPackItemId,
          result.data.sharedPackToken,
          result.data.placeId,
          result.data.publicComment,
          result.data.sortOrder
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    sharedPackItemId: number;
    sharedPackToken: string;
    placeId: string;
    publicComment: string | null;
    sortOrder: number;
  } {
    return {
      sharedPackItemId: this.sharedPackItemId.value,
      sharedPackToken: this.sharedPackToken.value,
      placeId: this.placeId.value,
      publicComment: this.publicComment,
      sortOrder: this.sortOrder.value,
    };
  }
}
