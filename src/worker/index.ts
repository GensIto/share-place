import { Hono } from "hono";
import { createAuth } from "./lib/auth";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { usersRoutes } from "./controller/UsersRoutes";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

const api = new Hono<{ Bindings: Env }>().use(logger()).use(cors());

api.on(["POST", "GET"], "/auth/*", (c) => {
  const db = drizzle(c.env.DB, { schema });
  const betterAuth = createAuth(db, c.env);
  return betterAuth.handler(c.req.raw);
});

const routes = api
  .get("/", (c) => c.json({ message: "Hello, World!" }))
  .route("/users", usersRoutes);

const app = new Hono<{ Bindings: Env }>()
  .route("/api", api)
  .all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
export type ApiType = typeof routes;
