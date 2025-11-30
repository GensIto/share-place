import { describe, it, expect } from "vitest";
import { User } from "./User";
import { EmailAddress, UserId, UserName } from "../../value-object";

describe("User", () => {
  const validUserIdString = "11111111-1111-4111-8111-111111111111";
  const validUserId = UserId.of(validUserIdString);
  const validNameString = "John Doe";
  const validName = UserName.of(validNameString);
  const validEmail = EmailAddress.of("john.doe@example.com");
  const validImage = "https://example.com/avatar.jpg";
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");
  const validUpdatedAt = new Date("2024-01-02T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なUserエンティティを作成できること", () => {
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt
      );

      expect(user.userId).toBe(validUserId);
      expect(user.name).toBe(validName);
      expect(user.email).toBe(validEmail);
      expect(user.image).toBe(validImage);
      expect(user.createdAt).toBe(validCreatedAt);
      expect(user.updatedAt).toBe(validUpdatedAt);
    });

    it("デフォルトパラメータで有効なUserエンティティを作成できること", () => {
      const beforeCreate = new Date();
      const user = User.of(validUserId, validName, validEmail);
      const afterCreate = new Date();

      expect(user.userId).toBe(validUserId);
      expect(user.name).toBe(validName);
      expect(user.email).toBe(validEmail);
      expect(user.image).toBeNull();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it("無効なユーザーIDでエラーをスローすること", () => {
      expect(() => UserId.of("invalid-id")).toThrow();
    });

    it("空の名前でエラーをスローすること", () => {
      expect(() => UserName.of("")).toThrow();
    });

    it("名前が長すぎる場合にエラーをスローすること", () => {
      const longName = "a".repeat(101);
      expect(() => UserName.of(longName)).toThrow();
    });

    it("無効な画像URLでエラーをスローすること", () => {
      expect(() =>
        User.of(validUserId, validName, validEmail, "not-a-url")
      ).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なユーザーで成功を返すこと", () => {
      const result = User.tryOf(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.userId).toBe(validUserId);
        expect(result.value.name).toBe(validName);
        expect(result.value.email).toBe(validEmail);
        expect(result.value.image).toBe(validImage);
        expect(result.value.createdAt).toBe(validCreatedAt);
        expect(result.value.updatedAt).toBe(validUpdatedAt);
      }
    });

    it("デフォルトパラメータで成功を返すこと", () => {
      const result = User.tryOf(validUserId, validName, validEmail);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.userId).toBe(validUserId);
        expect(result.value.name).toBe(validName);
        expect(result.value.email).toBe(validEmail);
        expect(result.value.image).toBeNull();
      }
    });

    it("無効なユーザーIDでエラーを返すこと", () => {
      const userIdResult = UserId.tryOf("invalid-id");

      expect(userIdResult.success).toBe(false);
      if (!userIdResult.success) {
        expect(userIdResult.error).toBeTruthy();
      }
    });

    it("空の名前でエラーを返すこと", () => {
      const nameResult = UserName.tryOf("");

      expect(nameResult.success).toBe(false);
      if (!nameResult.success) {
        expect(nameResult.error).toBeTruthy();
      }
    });

    it("名前が長すぎる場合にエラーを返すこと", () => {
      const longName = "a".repeat(101);
      const nameResult = UserName.tryOf(longName);

      expect(nameResult.success).toBe(false);
      if (!nameResult.success) {
        expect(nameResult.error).toBeTruthy();
      }
    });
  });

  describe("toJson", () => {
    it("ユーザーをJSONに変換できること", () => {
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt
      );

      const json = user.toJson();

      expect(json).toEqual({
        userId: validUserIdString,
        name: validNameString,
        email: validEmail.value,
        image: validImage,
        createdAt: validCreatedAt.toISOString(),
        updatedAt: validUpdatedAt.toISOString(),
      });
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt
      );

      const json = user.toJson();

      expect(typeof json.userId).toBe("string");
      expect(typeof json.name).toBe("string");
      expect(typeof json.email).toBe("string");
      expect(typeof json.createdAt).toBe("string");
      expect(typeof json.updatedAt).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const user = User.of(validUserId, validName, validEmail);

      const originalUserId = user.userId;
      const originalName = user.name;
      const originalEmail = user.email;

      expect(user.userId).toBe(originalUserId);
      expect(user.name).toBe(originalName);
      expect(user.email).toBe(originalEmail);
    });
  });
});
