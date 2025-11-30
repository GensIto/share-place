import { z } from "zod";
import { UserId } from "../../value-object/user";
import {
  CategoryId,
  CategoryName,
  CategoryEmoji,
} from "../../value-object/category";
import { DisplayOrder } from "../../value-object/collection";

const categorySchema = z.object({
  categoryId: z.custom<CategoryId>(
    (val) => val instanceof CategoryId,
    "Invalid category ID"
  ),
  userId: z.custom<UserId>((val) => val instanceof UserId, "Invalid user ID"),
  name: z.custom<CategoryName>(
    (val) => val instanceof CategoryName,
    "Invalid category name"
  ),
  emoji: z
    .custom<CategoryEmoji>(
      (val) => val instanceof CategoryEmoji,
      "Invalid category emoji"
    )
    .nullable(),
  displayOrder: z.custom<DisplayOrder>(
    (val) => val instanceof DisplayOrder,
    "Invalid display order"
  ),
  createdAt: z.date(),
});

export class Category {
  private constructor(
    public readonly categoryId: CategoryId,
    public readonly userId: UserId,
    public readonly name: CategoryName,
    public readonly emoji: CategoryEmoji | null,
    public readonly displayOrder: DisplayOrder,
    public readonly createdAt: Date
  ) {}

  static of(
    categoryId: CategoryId,
    userId: UserId,
    name: CategoryName,
    emoji: CategoryEmoji | null = null,
    displayOrder: DisplayOrder = DisplayOrder.of(0),
    createdAt: Date = new Date()
  ): Category {
    const validated = categorySchema.parse({
      categoryId,
      userId,
      name,
      emoji,
      displayOrder,
      createdAt,
    });
    return new Category(
      validated.categoryId,
      validated.userId,
      validated.name,
      validated.emoji,
      validated.displayOrder,
      validated.createdAt
    );
  }

  static tryOf(
    categoryId: CategoryId,
    userId: UserId,
    name: CategoryName,
    emoji: CategoryEmoji | null = null,
    displayOrder: DisplayOrder = DisplayOrder.of(0),
    createdAt: Date = new Date()
  ): { success: true; value: Category } | { success: false; error: string } {
    const result = categorySchema.safeParse({
      categoryId,
      userId,
      name,
      emoji,
      displayOrder,
      createdAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new Category(
          result.data.categoryId,
          result.data.userId,
          result.data.name,
          result.data.emoji,
          result.data.displayOrder,
          result.data.createdAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    categoryId: string;
    userId: string;
    name: string;
    emoji: string | null;
    displayOrder: number;
    createdAt: string;
  } {
    return {
      categoryId: this.categoryId.value,
      userId: this.userId.value,
      name: this.name.value,
      emoji: this.emoji?.value ?? null,
      displayOrder: this.displayOrder.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
