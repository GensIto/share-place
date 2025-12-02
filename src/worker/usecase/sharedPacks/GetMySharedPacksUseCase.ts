import { ISharedPackRepository } from "../../infrastructure/repository/SharedPackRepository";
import { UserId } from "../../domain/value-object/user";

export type GetMySharedPacksInput = {
  userId: string;
  limit?: number;
  offset?: number;
};

export type GetMySharedPacksOutput = {
  sharedPacks: Array<{
    shareToken: string;
    shareUrl: string;
    title: string;
    message: string | null;
    itemCount: number;
    thumbnails: string[];
    createdAt: string;
  }>;
  totalCount: number;
  hasMore: boolean;
};

export class GetMySharedPacksUseCase {
  constructor(
    private readonly sharedPackRepository: ISharedPackRepository,
    private readonly baseUrl: string
  ) {}

  async invoke(input: GetMySharedPacksInput): Promise<GetMySharedPacksOutput> {
    const userId = UserId.of(input.userId);
    const limit = input.limit ?? 20;
    const offset = input.offset ?? 0;

    const result = await this.sharedPackRepository.findByCreatorId(
      userId,
      limit,
      offset
    );

    return {
      sharedPacks: result.sharedPacks.map((pack) => ({
        shareToken: pack.shareToken,
        shareUrl: `${this.baseUrl}/p/${pack.shareToken}`,
        title: pack.title,
        message: pack.message,
        itemCount: pack.itemCount,
        thumbnails: pack.thumbnails,
        createdAt: pack.createdAt.toISOString(),
      })),
      totalCount: result.totalCount,
      hasMore: offset + result.sharedPacks.length < result.totalCount,
    };
  }
}
