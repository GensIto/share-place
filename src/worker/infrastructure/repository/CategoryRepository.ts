import { eq, and, count } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { categories } from "../../db/categories";
import { collections } from "../../db/collections";
import { Category } from "../../domain/entities";
import {
  CategoryId,
  CategoryName,
  CategoryEmoji,
} from "../../domain/value-object/category";
import { UserId } from "../../domain/value-object/user";
import { DisplayOrder } from "../../domain/value-object/collection";
import * as schema from "../../db/schema";

export type CategoryWithCount = {
  category: Category;
  collectionCount: number;
};

export interface ICategoryRepository {
  findById(categoryId: CategoryId): Promise<Category | null>;
  findByUserIdWithCount(userId: UserId): Promise<CategoryWithCount[]>;
  findByUserIdAndName(
    userId: UserId,
    name: CategoryName
  ): Promise<Category | null>;
  create(category: Category): Promise<Category>;
  delete(categoryId: CategoryId): Promise<void>;
}

export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  async findById(categoryId: CategoryId): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.categoryId, categoryId.value))
      .get();

    if (!result) {
      return null;
    }

    return this.toEntity(result);
  }

  async findByUserIdWithCount(userId: UserId): Promise<CategoryWithCount[]> {
    const results = await this.db
      .select({
        category: categories,
        collectionCount: count(collections.collectionId),
      })
      .from(categories)
      .leftJoin(collections, eq(categories.categoryId, collections.categoryId))
      .where(eq(categories.userId, userId.value))
      .groupBy(categories.categoryId)
      .orderBy(categories.createdAt)
      .all();

    return results.map((r) => ({
      category: this.toEntity(r.category),
      collectionCount: r.collectionCount,
    }));
  }

  async findByUserIdAndName(
    userId: UserId,
    name: CategoryName
  ): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(
        and(eq(categories.userId, userId.value), eq(categories.name, name.value))
      )
      .get();

    if (!result) {
      return null;
    }

    return this.toEntity(result);
  }

  async create(category: Category): Promise<Category> {
    const result = await this.db
      .insert(categories)
      .values({
        categoryId: category.categoryId.value,
        userId: category.userId.value,
        name: category.name.value,
        emoji: category.emoji?.value ?? null,
        displayOrder: category.displayOrder.value,
        createdAt: category.createdAt,
      })
      .returning()
      .get();

    return this.toEntity(result);
  }

  async delete(categoryId: CategoryId): Promise<void> {
    await this.db
      .delete(categories)
      .where(eq(categories.categoryId, categoryId.value))
      .run();
  }

  private toEntity(row: typeof categories.$inferSelect): Category {
    return Category.of(
      CategoryId.of(row.categoryId),
      UserId.of(row.userId),
      CategoryName.of(row.name),
      row.emoji ? CategoryEmoji.of(row.emoji) : null,
      DisplayOrder.of(row.displayOrder),
      row.createdAt
    );
  }
}
