import { z } from "zod";
import { UserId } from "../../value-object/user";
import { CollectionId, CollectionName, DisplayOrder } from "../../value-object/collection";

const collectionSchema = z.object({
  collectionId: z.custom<CollectionId>((val) => val instanceof CollectionId, "Invalid collection ID"),
  userId: z.custom<UserId>((val) => val instanceof UserId, "Invalid user ID"),
  name: z.custom<CollectionName>((val) => val instanceof CollectionName, "Invalid collection name"),
  iconEmoji: z.string().nullable(),
  displayOrder: z.custom<DisplayOrder>((val) => val instanceof DisplayOrder, "Invalid display order"),
  isDefault: z.boolean(),
  createdAt: z.date(),
});

export class Collection {
  private constructor(
    public readonly collectionId: CollectionId,
    public readonly userId: UserId,
    public readonly name: CollectionName,
    public readonly iconEmoji: string | null,
    public readonly displayOrder: DisplayOrder,
    public readonly isDefault: boolean,
    public readonly createdAt: Date
  ) {}

  static of(
    collectionId: CollectionId,
    userId: UserId,
    name: CollectionName,
    iconEmoji: string | null = null,
    displayOrder: DisplayOrder = DisplayOrder.of(0),
    isDefault: boolean = false,
    createdAt: Date = new Date()
  ): Collection {
    const validated = collectionSchema.parse({
      collectionId,
      userId,
      name,
      iconEmoji,
      displayOrder,
      isDefault,
      createdAt,
    });
    return new Collection(
      validated.collectionId,
      validated.userId,
      validated.name,
      validated.iconEmoji,
      validated.displayOrder,
      validated.isDefault,
      validated.createdAt
    );
  }

  static tryOf(
    collectionId: CollectionId,
    userId: UserId,
    name: CollectionName,
    iconEmoji: string | null = null,
    displayOrder: DisplayOrder = DisplayOrder.of(0),
    isDefault: boolean = false,
    createdAt: Date = new Date()
  ): { success: true; value: Collection } | { success: false; error: string } {
    const result = collectionSchema.safeParse({
      collectionId,
      userId,
      name,
      iconEmoji,
      displayOrder,
      isDefault,
      createdAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new Collection(
          result.data.collectionId,
          result.data.userId,
          result.data.name,
          result.data.iconEmoji,
          result.data.displayOrder,
          result.data.isDefault,
          result.data.createdAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    collectionId: string;
    userId: string;
    name: string;
    iconEmoji: string | null;
    displayOrder: number;
    isDefault: boolean;
    createdAt: string;
  } {
    return {
      collectionId: this.collectionId.value,
      userId: this.userId.value,
      name: this.name.value,
      iconEmoji: this.iconEmoji,
      displayOrder: this.displayOrder.value,
      isDefault: this.isDefault,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
