import { z } from "zod";
import { UserId } from "../../value-object/user";
import { ShareToken, PackTitle } from "../../value-object/sharedPack";

const sharedPackSchema = z.object({
  shareToken: z.custom<ShareToken>((val) => val instanceof ShareToken, "Invalid share token"),
  creatorId: z.custom<UserId>((val) => val instanceof UserId, "Invalid creator ID"),
  title: z.custom<PackTitle>((val) => val instanceof PackTitle, "Invalid pack title"),
  message: z.string().nullable(),
  createdAt: z.date(),
});

export class SharedPack {
  private constructor(
    public readonly shareToken: ShareToken,
    public readonly creatorId: UserId,
    public readonly title: PackTitle,
    public readonly message: string | null,
    public readonly createdAt: Date
  ) {}

  static of(
    shareToken: ShareToken,
    creatorId: UserId,
    title: PackTitle,
    message: string | null = null,
    createdAt: Date = new Date()
  ): SharedPack {
    const validated = sharedPackSchema.parse({
      shareToken,
      creatorId,
      title,
      message,
      createdAt,
    });
    return new SharedPack(
      validated.shareToken,
      validated.creatorId,
      validated.title,
      validated.message,
      validated.createdAt
    );
  }

  static tryOf(
    shareToken: ShareToken,
    creatorId: UserId,
    title: PackTitle,
    message: string | null = null,
    createdAt: Date = new Date()
  ): { success: true; value: SharedPack } | { success: false; error: string } {
    const result = sharedPackSchema.safeParse({
      shareToken,
      creatorId,
      title,
      message,
      createdAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new SharedPack(
          result.data.shareToken,
          result.data.creatorId,
          result.data.title,
          result.data.message,
          result.data.createdAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    shareToken: string;
    creatorId: string;
    title: string;
    message: string | null;
    createdAt: string;
  } {
    return {
      shareToken: this.shareToken.value,
      creatorId: this.creatorId.value,
      title: this.title.value,
      message: this.message,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
