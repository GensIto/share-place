import { describe, it, expect } from "vitest";
import { SharedPack } from "./SharedPack";
import { UserId } from "../../value-object/user";
import { ShareToken, PackTitle } from "../../value-object/sharedPack";

describe("SharedPack", () => {
  const validShareToken = ShareToken.of("abc12345");
  const validCreatorId = UserId.of("11111111-1111-4111-8111-111111111111");
  const validTitle = PackTitle.of("渋谷のおすすめカフェ");
  const validMessage = "友達におすすめのカフェをシェアします！";
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なSharedPackを作成できること", () => {
      const pack = SharedPack.of(
        validShareToken,
        validCreatorId,
        validTitle,
        validMessage,
        validCreatedAt
      );

      expect(pack.shareToken).toBe(validShareToken);
      expect(pack.creatorId).toBe(validCreatorId);
      expect(pack.title).toBe(validTitle);
      expect(pack.message).toBe(validMessage);
      expect(pack.createdAt).toBe(validCreatedAt);
    });

    it("デフォルトパラメータで有効なSharedPackを作成できること", () => {
      const beforeCreate = new Date();
      const pack = SharedPack.of(validShareToken, validCreatorId, validTitle);
      const afterCreate = new Date();

      expect(pack.shareToken).toBe(validShareToken);
      expect(pack.creatorId).toBe(validCreatorId);
      expect(pack.title).toBe(validTitle);
      expect(pack.message).toBeNull();
      expect(pack.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(pack.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe("tryOf", () => {
    it("有効なSharedPackで成功を返すこと", () => {
      const result = SharedPack.tryOf(
        validShareToken,
        validCreatorId,
        validTitle,
        validMessage,
        validCreatedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.shareToken).toBe(validShareToken);
        expect(result.value.creatorId).toBe(validCreatorId);
        expect(result.value.title).toBe(validTitle);
      }
    });
  });

  describe("toJson", () => {
    it("SharedPackをJSONに変換できること", () => {
      const pack = SharedPack.of(
        validShareToken,
        validCreatorId,
        validTitle,
        validMessage,
        validCreatedAt
      );

      const json = pack.toJson();

      expect(json).toEqual({
        shareToken: "abc12345",
        creatorId: "11111111-1111-4111-8111-111111111111",
        title: "渋谷のおすすめカフェ",
        message: "友達におすすめのカフェをシェアします！",
        createdAt: validCreatedAt.toISOString(),
      });
    });

    it("null値を正しく処理できること", () => {
      const pack = SharedPack.of(validShareToken, validCreatorId, validTitle);

      const json = pack.toJson();

      expect(json.message).toBeNull();
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const pack = SharedPack.of(validShareToken, validCreatorId, validTitle);

      const originalShareToken = pack.shareToken;
      const originalCreatorId = pack.creatorId;
      const originalTitle = pack.title;

      expect(pack.shareToken).toBe(originalShareToken);
      expect(pack.creatorId).toBe(originalCreatorId);
      expect(pack.title).toBe(originalTitle);
    });
  });
});
