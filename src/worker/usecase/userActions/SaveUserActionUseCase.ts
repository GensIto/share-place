import { IUserActionRepository } from "../../infrastructure/repository/UserActionRepository";
import { IPlaceRepository } from "../../infrastructure/repository/PlaceRepository";
import { UserAction } from "../../domain/entities";
import { ActionType } from "../../domain/value-object/userAction";
import { UserId } from "../../domain/value-object/user";
import { PlaceId } from "../../domain/value-object/place";
import { HTTPException } from "hono/http-exception";

export type SaveUserActionInput = {
  userId: string;
  placeId: string;
  actionType: string;
};

export type SaveUserActionOutput = {
  userAction: UserAction;
};

export class SaveUserActionUseCase {
  constructor(
    private readonly userActionRepository: IUserActionRepository,
    private readonly placeRepository: IPlaceRepository
  ) {}

  async invoke(input: SaveUserActionInput): Promise<SaveUserActionOutput> {
    const userId = UserId.of(input.userId);
    const placeId = PlaceId.of(input.placeId);

    const actionTypeResult = ActionType.tryOf(input.actionType);
    if (!actionTypeResult.success) {
      throw new HTTPException(400, {
        message: "actionType は LIKE または NOPE を指定してください",
      });
    }
    const actionType = actionTypeResult.value;

    const place = await this.placeRepository.findById(placeId);
    if (!place) {
      throw new HTTPException(400, {
        message: "指定された場所が見つかりません",
      });
    }

    const created = await this.userActionRepository.create({
      userId,
      placeId,
      actionType,
    });

    return { userAction: created };
  }
}
