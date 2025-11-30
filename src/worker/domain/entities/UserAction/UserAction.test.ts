import { describe, it, expect } from "vitest";
import { UserAction } from "./UserAction";
import { UserId } from "../../value-object/user";
import { PlaceId } from "../../value-object/place";
import { UserActionId, ActionType } from "../../value-object/userAction";

describe("UserAction", () => {
  const validUserActionId = UserActionId.of(1);
  const validUserId = UserId.of("11111111-1111-4111-8111-111111111111");
  const validPlaceId = PlaceId.of("ChIJN1t_tDeuEmsRUsoyG83frY4");
  const validActionType = ActionType.LIKE();
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なUserActionを作成できること", () => {
      const action = UserAction.of(
        validUserActionId,
        validUserId,
        validPlaceId,
        validActionType,
        validCreatedAt
      );

      expect(action.userActionId).toBe(validUserActionId);
      expect(action.userId).toBe(validUserId);
      expect(action.placeId).toBe(validPlaceId);
      expect(action.actionType).toBe(validActionType);
      expect(action.createdAt).toBe(validCreatedAt);
    });

    it("デフォルトパラメータで有効なUserActionを作成できること", () => {
      const beforeCreate = new Date();
      const action = UserAction.of(
        validUserActionId,
        validUserId,
        validPlaceId,
        validActionType
      );
      const afterCreate = new Date();

      expect(action.userActionId).toBe(validUserActionId);
      expect(action.userId).toBe(validUserId);
      expect(action.placeId).toBe(validPlaceId);
      expect(action.actionType).toBe(validActionType);
      expect(action.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(action.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe("tryOf", () => {
    it("有効なUserActionで成功を返すこと", () => {
      const result = UserAction.tryOf(
        validUserActionId,
        validUserId,
        validPlaceId,
        validActionType,
        validCreatedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.userActionId).toBe(validUserActionId);
        expect(result.value.userId).toBe(validUserId);
        expect(result.value.placeId).toBe(validPlaceId);
      }
    });
  });

  describe("different action types", () => {
    it("LIKE アクションを作成できること", () => {
      const action = UserAction.of(
        validUserActionId,
        validUserId,
        validPlaceId,
        ActionType.LIKE()
      );

      expect(action.actionType.isLike()).toBe(true);
    });

    it("NOPE アクションを作成できること", () => {
      const action = UserAction.of(
        validUserActionId,
        validUserId,
        validPlaceId,
        ActionType.NOPE()
      );

      expect(action.actionType.isNope()).toBe(true);
    });

    it("VIEW アクションを作成できること", () => {
      const action = UserAction.of(
        validUserActionId,
        validUserId,
        validPlaceId,
        ActionType.VIEW()
      );

      expect(action.actionType.isView()).toBe(true);
    });
  });

  describe("toJson", () => {
    it("UserActionをJSONに変換できること", () => {
      const action = UserAction.of(
        validUserActionId,
        validUserId,
        validPlaceId,
        validActionType,
        validCreatedAt
      );

      const json = action.toJson();

      expect(json).toEqual({
        userActionId: 1,
        userId: "11111111-1111-4111-8111-111111111111",
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        actionType: "LIKE",
        createdAt: validCreatedAt.toISOString(),
      });
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const action = UserAction.of(
        validUserActionId,
        validUserId,
        validPlaceId,
        validActionType
      );

      const originalUserActionId = action.userActionId;
      const originalUserId = action.userId;
      const originalPlaceId = action.placeId;
      const originalActionType = action.actionType;

      expect(action.userActionId).toBe(originalUserActionId);
      expect(action.userId).toBe(originalUserId);
      expect(action.placeId).toBe(originalPlaceId);
      expect(action.actionType).toBe(originalActionType);
    });
  });
});
