import {
  IUserActionRepository,
  UserActionWithPlace,
} from "../../infrastructure/repository/UserActionRepository";
import { ActionType } from "../../domain/value-object/userAction";
import { UserId } from "../../domain/value-object/user";
import { PlaceId } from "../../domain/value-object/place";

export type GetUserActionsInput = {
  userId: string;
  actionType?: string;
  placeIds?: string[];
  limit?: number;
  offset?: number;
};

export type GetUserActionsOutput = {
  actions: UserActionWithPlace[];
  totalCount: number;
  hasMore: boolean;
};

export class GetUserActionsUseCase {
  constructor(private readonly userActionRepository: IUserActionRepository) {}

  async invoke(input: GetUserActionsInput): Promise<GetUserActionsOutput> {
    const userId = UserId.of(input.userId);
    const limit = input.limit ?? 100;
    const offset = input.offset ?? 0;

    const actionType = input.actionType
      ? ActionType.of(input.actionType)
      : undefined;

    const placeIds = input.placeIds?.map((id) => PlaceId.of(id));

    const result = await this.userActionRepository.findByUserId({
      userId,
      actionType,
      placeIds,
      limit,
      offset,
    });

    return {
      actions: result.actions,
      totalCount: result.totalCount,
      hasMore: offset + result.actions.length < result.totalCount,
    };
  }
}
