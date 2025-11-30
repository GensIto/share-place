import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import z from "zod";
import { UserRepository } from "../infrastructure/repository/UserRepository";
import { FindByEmailUseCase } from "../usecase/users/FindByEmail";
import * as schema from "../db/schema";
import { EmailAddress } from "../domain/value-object";

type Env = {
  Bindings: { DB: D1Database };
  Variables: { userRepository: UserRepository };
};

const factory = createFactory<Env>();

const injectUserRepository = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const userRepository = new UserRepository(database);
  c.set("userRepository", userRepository);
  await next();
});

export const usersRoutes = new Hono<Env>().get(
  "/",
  injectUserRepository,
  zValidator("json", z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = c.req.valid("json");
    const userRepository = c.get("userRepository");
    const findByEmailUseCase = new FindByEmailUseCase(userRepository);
    const user = await findByEmailUseCase.invoke(EmailAddress.of(email));
    return c.json(user);
  }
);
