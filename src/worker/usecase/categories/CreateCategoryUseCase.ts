import { ICategoryRepository } from "../../infrastructure/repository/CategoryRepository";
import { Category } from "../../domain/entities";
import {
  CategoryId,
  CategoryName,
  CategoryEmoji,
} from "../../domain/value-object/category";
import { UserId } from "../../domain/value-object/user";
import { HTTPException } from "hono/http-exception";

export type CreateCategoryInput = {
  userId: string;
  name: string;
  emoji?: string | null;
};

export type CreateCategoryOutput = {
  category: Category;
};

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async invoke(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const userId = UserId.of(input.userId);
    const name = CategoryName.of(input.name);

    const existing = await this.categoryRepository.findByUserIdAndName(
      userId,
      name
    );
    if (existing) {
      throw new HTTPException(400, {
        message: "同じ名前のカテゴリが既に存在します",
      });
    }

    const category = Category.of(
      CategoryId.of(crypto.randomUUID()),
      userId,
      name,
      input.emoji ? CategoryEmoji.of(input.emoji) : null
    );

    const created = await this.categoryRepository.create(category);

    return { category: created };
  }
}
