import { z } from "zod";
import { EmailAddress, UserId } from "../../value-object";

const userSchema = z.object({
  userId: z.custom<UserId>((val) => val instanceof UserId, "Invalid user ID"),
  email: z.custom<EmailAddress>(
    (val) => val instanceof EmailAddress,
    "Invalid email address"
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class User {
  private constructor(
    public readonly userId: UserId,
    public readonly email: EmailAddress,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static of(
    userId: UserId,
    email: EmailAddress,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): User {
    const validated = userSchema.parse({
      userId,
      email,
      createdAt,
      updatedAt,
    });
    return new User(
      validated.userId,
      validated.email,
      validated.createdAt,
      validated.updatedAt
    );
  }

  static tryOf(
    userId: UserId,
    email: EmailAddress,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): { success: true; value: User } | { success: false; error: string } {
    const result = userSchema.safeParse({
      userId,
      email,
      createdAt,
      updatedAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new User(
          result.data.userId,
          result.data.email,
          result.data.createdAt,
          result.data.updatedAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    userId: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      userId: this.userId.value,
      email: this.email.value,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
