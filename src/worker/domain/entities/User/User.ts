import { z } from "zod";
import { EmailAddress, UserId, UserName } from "../../value-object";

const userSchema = z.object({
  userId: z.custom<UserId>((val) => val instanceof UserId, "Invalid user ID"),
  name: z.custom<UserName>(
    (val) => val instanceof UserName,
    "Invalid user name"
  ),
  email: z.custom<EmailAddress>(
    (val) => val instanceof EmailAddress,
    "Invalid email address"
  ),
  image: z.url("Invalid image URL").nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class User {
  private constructor(
    public readonly userId: UserId,
    public readonly name: UserName,
    public readonly email: EmailAddress,
    public readonly image: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static of(
    userId: UserId,
    name: UserName,
    email: EmailAddress,
    image: string | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): User {
    const validated = userSchema.parse({
      userId,
      name,
      email,
      image,
      createdAt,
      updatedAt,
    });
    return new User(
      validated.userId,
      validated.name,
      validated.email,
      validated.image,
      validated.createdAt,
      validated.updatedAt
    );
  }

  static tryOf(
    userId: UserId,
    name: UserName,
    email: EmailAddress,
    image: string | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): { success: true; value: User } | { success: false; error: string } {
    const result = userSchema.safeParse({
      userId,
      name,
      email,
      image,
      createdAt,
      updatedAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new User(
          result.data.userId,
          result.data.name,
          result.data.email,
          result.data.image,
          result.data.createdAt,
          result.data.updatedAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  toJson(): {
    userId: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      userId: this.userId.value,
      name: this.name.value,
      email: this.email.value,
      image: this.image,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
