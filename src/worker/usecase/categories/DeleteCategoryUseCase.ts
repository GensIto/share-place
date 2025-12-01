import { ICategoryRepository } from "../../infrastructure/repository/CategoryRepository";
import { CategoryId } from "../../domain/value-object/category";
import { UserId } from "../../domain/value-object/user";
import { HTTPException } from "hono/http-exception";

export type DeleteCategoryInput = {
  categoryId: string;
  userId: string;
};

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async invoke(input: DeleteCategoryInput): Promise<void> {
    const categoryId = CategoryId.of(input.categoryId);
    const userId = UserId.of(input.userId);

    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new HTTPException(404, {
        message: "カテゴリが見つかりません",
      });
    }

    if (!category.userId.equals(userId)) {
      throw new HTTPException(403, {
        message: "このカテゴリを削除する権限がありません",
      });
    }

    await this.categoryRepository.delete(categoryId);
  }
}
