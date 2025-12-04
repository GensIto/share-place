import { Hono } from "hono";
import { usersRoutes } from "./controller/UsersRoutes";
import { placesRoutes } from "./controller/PlacesRoutes";
import { categoriesRoutes } from "./controller/CategoriesRoutes";
import { userActionsRoutes } from "./controller/UserActionsRoutes";
import { sharedPacksRoutes } from "./controller/SharedPacksRoutes";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

const api = new Hono<{ Bindings: Env }>().use(logger()).use(cors());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = api
  .get("/", (c) => c.json({ message: "Hello, World!" }))
  .route("/users", usersRoutes)
  .route("/places", placesRoutes)
  .route("/categories", categoriesRoutes)
  .route("/user-actions", userActionsRoutes)
  .route("/shared-packs", sharedPacksRoutes);

const app = new Hono<{ Bindings: Env }>()
  .route("/api", api)
  .all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
export type ApiType = typeof routes;
