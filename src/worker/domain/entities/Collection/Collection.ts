import { z } from "zod";
import { UserId } from "../../value-object/user";
import { CategoryId } from "../../value-object/category";
import {
  CollectionId,
  CollectionName,
  DisplayOrder,
} from "../../value-object/collection";

const collectionSchema = z.object({
  collectionId: z.custom<CollectionId>(
    (val) => val instanceof CollectionId,
    "Invalid collection ID"
  ),
  userId: z.custom<UserId>((val) => val instanceof UserId, "Invalid user ID"),
  categoryId: z
    .custom<CategoryId>(
      (val) => val instanceof CategoryId,
      "Invalid category ID"
    )
    .nullable(),
  name: z.custom<CollectionName>(
    (val) => val instanceof CollectionName,
    "Invalid collection name"
  ),
  displayOrder: z.custom<DisplayOrder>(
    (val) => val instanceof DisplayOrder,
    "Invalid display order"
  ),
  isDefault: z.boolean(),
  createdAt: z.date(),
});

export class Collection {
  private constructor(
    public readonly collectionId: CollectionId,
    public readonly userId: UserId,
    public readonly categoryId: CategoryId | null,
    public readonly name: CollectionName,
    public readonly displayOrder: DisplayOrder,
    public readonly isDefault: boolean,
    public readonly createdAt: Date
  ) {}

  static of(
    collectionId: CollectionId,
    userId: UserId,
    name: CollectionName,
    categoryId: CategoryId | null = null,
    displayOrder: DisplayOrder = DisplayOrder.of(0),
    isDefault: boolean = false,
    createdAt: Date = new Date()
  ): Collection {
    const validated = collectionSchema.parse({
      collectionId,
      userId,
      categoryId,
      name,
      displayOrder,
      isDefault,
      createdAt,
    });
    return new Collection(
      validated.collectionId,
      validated.userId,
      validated.categoryId,
      validated.name,
      validated.displayOrder,
      validated.isDefault,
      validated.createdAt
    );
  }

  static tryOf(
    collectionId: CollectionId,
    userId: UserId,
    name: CollectionName,
    categoryId: CategoryId | null = null,
    displayOrder: DisplayOrder = DisplayOrder.of(0),
    isDefault: boolean = false,
    createdAt: Date = new Date()
  ): { success: true; value: Collection } | { success: false; error: string } {
    const result = collectionSchema.safeParse({
      collectionId,
      userId,
      categoryId,
      name,
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
          result.data.categoryId,
          result.data.name,
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
    categoryId: string | null;
    name: string;
    displayOrder: number;
    isDefault: boolean;
    createdAt: string;
  } {
    return {
      collectionId: this.collectionId.value,
      userId: this.userId.value,
      categoryId: this.categoryId?.value ?? null,
      name: this.name.value,
      displayOrder: this.displayOrder.value,
      isDefault: this.isDefault,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
