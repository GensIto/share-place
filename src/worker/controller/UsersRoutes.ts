import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import z from "zod";
import { UserRepository } from "../infrastructure/repository/UserRepository";
import { FindByEmailUseCase } from "../usecase/users/FindByEmail";
import { UpsertUserUseCase } from "../usecase/users/UpsertUserUseCase";
import * as schema from "../db/schema";
import { EmailAddress } from "../domain/value-object";
import { optionalAuth, requireAuth } from "../middleware";

type Env = {
  Bindings: { DB: D1Database } & Cloudflare.Env;
  Variables: {
    userRepository: UserRepository;
    userId: string;
    isAnonymous?: boolean;
  };
};

const factory = createFactory<Env>();

const injectUserRepository = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const userRepository = new UserRepository(database);
  c.set("userRepository", userRepository);
  await next();
});

const upsertUserSchema = z.object({
  userId: z.string().min(1),
  email: z.email(),
});

export const usersRoutes = new Hono<Env>()
  .get(
    "/",
    injectUserRepository,
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
      const { email } = c.req.valid("json");
      const userRepository = c.get("userRepository");
      const findByEmailUseCase = new FindByEmailUseCase(userRepository);

      const user = await findByEmailUseCase.invoke(EmailAddress.of(email));
      return c.json(user.toJson());
    }
  )
  .post(
    "/",
    optionalAuth,
    injectUserRepository,
    zValidator("json", upsertUserSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userRepository = c.get("userRepository");
      const upsertUserUseCase = new UpsertUserUseCase(userRepository);
      const user = await upsertUserUseCase.invoke(input);
      return c.json(user.toJson());
    }
  )
  .post(
    "/me",
    injectUserRepository,
    requireAuth,
    zValidator("json", upsertUserSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userRepository = c.get("userRepository");
      const userId = c.get("userId");

      // 認証されたユーザーのIDとリクエストのuserIdが一致することを確認
      if (input.userId !== userId) {
        return c.json(
          { error: "FORBIDDEN", message: "ユーザーIDが一致しません" },
          403
        );
      }

      const findByEmailUseCase = new FindByEmailUseCase(userRepository);
      const user = await findByEmailUseCase.invoke(
        EmailAddress.of(input.email)
      );

      return c.json(user.toJson(), 200);
    }
  );
