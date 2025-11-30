import { z } from "zod";
import { UserId } from "../../value-object/user";
import { PlaceId } from "../../value-object/place";
import { UserActionId, ActionType } from "../../value-object/userAction";

const userActionSchema = z.object({
  userActionId: z.custom<UserActionId>((val) => val instanceof UserActionId, "Invalid user action ID"),
  userId: z.custom<UserId>((val) => val instanceof UserId, "Invalid user ID"),
  placeId: z.custom<PlaceId>((val) => val instanceof PlaceId, "Invalid place ID"),
  actionType: z.custom<ActionType>((val) => val instanceof ActionType, "Invalid action type"),
  createdAt: z.date(),
});

export class UserAction {
  private constructor(
    public readonly userActionId: UserActionId,
    public readonly userId: UserId,
    public readonly placeId: PlaceId,
    public readonly actionType: ActionType,
    public readonly createdAt: Date
  ) {}

  static of(
    userActionId: UserActionId,
    userId: UserId,
    placeId: PlaceId,
    actionType: ActionType,
    createdAt: Date = new Date()
  ): UserAction {
    const validated = userActionSchema.parse({
      userActionId,
      userId,
      placeId,
      actionType,
      createdAt,
    });
    return new UserAction(
      validated.userActionId,
      validated.userId,
      validated.placeId,
      validated.actionType,
      validated.createdAt
    );
  }

  static tryOf(
    userActionId: UserActionId,
    userId: UserId,
    placeId: PlaceId,
    actionType: ActionType,
    createdAt: Date = new Date()
  ): { success: true; value: UserAction } | { success: false; error: string } {
    const result = userActionSchema.safeParse({
      userActionId,
      userId,
      placeId,
      actionType,
      createdAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new UserAction(
          result.data.userActionId,
          result.data.userId,
          result.data.placeId,
          result.data.actionType,
          result.data.createdAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    userActionId: number;
    userId: string;
    placeId: string;
    actionType: string;
    createdAt: string;
  } {
    return {
      userActionId: this.userActionId.value,
      userId: this.userId.value,
      placeId: this.placeId.value,
      actionType: this.actionType.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
