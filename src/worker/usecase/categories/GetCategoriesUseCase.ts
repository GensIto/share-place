import {
  ICategoryRepository,
  CategoryWithCount,
} from "../../infrastructure/repository/CategoryRepository";
import { UserId } from "../../domain/value-object/user";

export type GetCategoriesOutput = {
  categories: CategoryWithCount[];
  totalCount: number;
};

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async invoke(userIdString: string): Promise<GetCategoriesOutput> {
    const userId = UserId.of(userIdString);

    const categories =
      await this.categoryRepository.findByUserIdWithCount(userId);

    return {
      categories,
      totalCount: categories.length,
    };
  }
}
