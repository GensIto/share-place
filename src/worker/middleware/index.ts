import { createFactory } from "hono/factory";
import { createAuth } from "../lib/auth";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

const factory = createFactory<{
  Bindings: { DB: D1Database } & Cloudflare.Env;
  Variables: { userId: string };
}>();

export const requireAuth = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const auth = createAuth(database, c.env);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "UNAUTHORIZED", message: "認証が必要です" }, 401);
  }

  c.set("userId", session.user.id);
  await next();
});
