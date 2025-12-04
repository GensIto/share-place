import { eq } from "drizzle-orm";
import { users } from "../../db/auth";
import { User } from "../../domain/entities";
import { UserId, EmailAddress } from "../../domain/value-object";
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../db/schema";

export interface IUserRepository {
  findByEmail(email: EmailAddress): Promise<User>;
  findByUserId(userId: UserId): Promise<User | null>;
  upsert(user: User): Promise<User>;
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
    // Firebase AuthのuidはUUID形式ではないため、ofFirebaseを使用
    return User.of(
      UserId.ofFirebase(user.userId),
      EmailAddress.of(user.email),
      user.createdAt,
      user.updatedAt
    );
  }

  async findByUserId(userId: UserId): Promise<User | null> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId.value))
      .get();
    if (!user) {
      return null;
    }
    // Firebase AuthのuidはUUID形式ではないため、ofFirebaseを使用
    return User.of(
      UserId.ofFirebase(user.userId),
      EmailAddress.of(user.email),
      user.createdAt,
      user.updatedAt
    );
  }

  async upsert(user: User): Promise<User> {
    const now = new Date();
    const existingUser = await this.findByUserId(user.userId);

    if (existingUser) {
      // 既存ユーザーを更新
      await this.db
        .update(users)
        .set({
          email: user.email.value,
          updatedAt: now,
        })
        .where(eq(users.userId, user.userId.value));
      
      return User.of(
        user.userId,
        user.email,
        existingUser.createdAt,
        now
      );
    } else {
      // 新規ユーザーを作成
      await this.db.insert(users).values({
        userId: user.userId.value,
        email: user.email.value,
        createdAt: now,
        updatedAt: now,
      });

      return User.of(
        user.userId,
        user.email,
        now,
        now
      );
    }
  }
}
