import { eq } from "drizzle-orm";
import { users } from "../../db/auth";
import { User } from "../../domain/entities";
import { UserId, UserName, EmailAddress } from "../../domain/value-object";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../db/schema";

export interface IUserRepository {
  findByEmail(email: EmailAddress): Promise<User>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}
  async findByEmail(email: EmailAddress): Promise<User> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.value))
      .get();
    if (!user) {
      throw new Error(`User with email ${email.value} not found`);
    }
    return User.of(
      UserId.of(user.userId),
      UserName.of(user.name),
      EmailAddress.of(user.email),
      user.image,
      user.createdAt,
      user.updatedAt
    );
  }
}
