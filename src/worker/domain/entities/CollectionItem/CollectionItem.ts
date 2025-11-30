import { z } from "zod";
import { CollectionId, CollectionItemId } from "../../value-object/collection";
import { PlaceId } from "../../value-object/place";
import { ShareToken } from "../../value-object/sharedPack";

const collectionItemSchema = z.object({
  collectionItemId: z.custom<CollectionItemId>((val) => val instanceof CollectionItemId, "Invalid collection item ID"),
  collectionId: z.custom<CollectionId>((val) => val instanceof CollectionId, "Invalid collection ID"),
  placeId: z.custom<PlaceId>((val) => val instanceof PlaceId, "Invalid place ID"),
  userMemo: z.string().nullable(),
  sourceShareToken: z.custom<ShareToken>((val) => val instanceof ShareToken, "Invalid share token").nullable(),
  createdAt: z.date(),
});

export class CollectionItem {
  private constructor(
    public readonly collectionItemId: CollectionItemId,
    public readonly collectionId: CollectionId,
    public readonly placeId: PlaceId,
    public readonly userMemo: string | null,
    public readonly sourceShareToken: ShareToken | null,
    public readonly createdAt: Date
  ) {}

  static of(
    collectionItemId: CollectionItemId,
    collectionId: CollectionId,
    placeId: PlaceId,
    userMemo: string | null = null,
    sourceShareToken: ShareToken | null = null,
    createdAt: Date = new Date()
  ): CollectionItem {
    const validated = collectionItemSchema.parse({
      collectionItemId,
      collectionId,
      placeId,
      userMemo,
      sourceShareToken,
      createdAt,
    });
    return new CollectionItem(
      validated.collectionItemId,
      validated.collectionId,
      validated.placeId,
      validated.userMemo,
      validated.sourceShareToken,
      validated.createdAt
    );
  }

  static tryOf(
    collectionItemId: CollectionItemId,
    collectionId: CollectionId,
    placeId: PlaceId,
    userMemo: string | null = null,
    sourceShareToken: ShareToken | null = null,
    createdAt: Date = new Date()
  ): { success: true; value: CollectionItem } | { success: false; error: string } {
    const result = collectionItemSchema.safeParse({
      collectionItemId,
      collectionId,
      placeId,
      userMemo,
      sourceShareToken,
      createdAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new CollectionItem(
          result.data.collectionItemId,
          result.data.collectionId,
          result.data.placeId,
          result.data.userMemo,
          result.data.sourceShareToken,
          result.data.createdAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    collectionItemId: number;
    collectionId: string;
    placeId: string;
    userMemo: string | null;
    sourceShareToken: string | null;
    createdAt: string;
  } {
    return {
      collectionItemId: this.collectionItemId.value,
      collectionId: this.collectionId.value,
      placeId: this.placeId.value,
      userMemo: this.userMemo,
      sourceShareToken: this.sourceShareToken?.value ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
