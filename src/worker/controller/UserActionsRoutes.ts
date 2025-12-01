import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { UserActionRepository } from "../infrastructure/repository/UserActionRepository";
import { PlaceRepository } from "../infrastructure/repository/PlaceRepository";
import { SaveUserActionUseCase, GetUserActionsUseCase } from "../usecase/userActions";
import * as schema from "../db/schema";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware";

type Env = {
  Bindings: { DB: D1Database } & Cloudflare.Env;
  Variables: {
    userActionRepository: UserActionRepository;
    placeRepository: PlaceRepository;
    userId: string;
  };
};

const factory = createFactory<Env>();

const injectRepositories = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const userActionRepository = new UserActionRepository(database);
  const placeRepository = new PlaceRepository(database);
  c.set("userActionRepository", userActionRepository);
  c.set("placeRepository", placeRepository);
  await next();
});

export const saveUserActionSchema = z.object({
  placeId: z.string().min(1),
  actionType: z.enum(["LIKE", "NOPE"]),
});

export const getUserActionsQuerySchema = z.object({
  actionType: z.enum(["LIKE", "NOPE"]).optional(),
  placeIds: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export const userActionsRoutes = new Hono<Env>()
  .post(
    "/",
    injectRepositories,
    requireAuth,
    zValidator("json", saveUserActionSchema),
    async (c) => {
      const userId = c.get("userId");
      const input = c.req.valid("json");
      const userActionRepository = c.get("userActionRepository");
      const placeRepository = c.get("placeRepository");
      const useCase = new SaveUserActionUseCase(
        userActionRepository,
        placeRepository
      );

      try {
        const result = await useCase.invoke({
          userId,
          placeId: input.placeId,
          actionType: input.actionType,
        });

        return c.json(result.userAction.toJson(), 201);
      } catch (error) {
        if (error instanceof HTTPException) {
          return c.json(
            { error: error.status, message: error.message },
            error.status
          );
        }
        throw error;
      }
    }
  )

  .get(
    "/",
    injectRepositories,
    requireAuth,
    zValidator("query", getUserActionsQuerySchema),
    async (c) => {
      const userId = c.get("userId");
      const query = c.req.valid("query");
      const userActionRepository = c.get("userActionRepository");
      const useCase = new GetUserActionsUseCase(userActionRepository);

      const placeIds = query.placeIds
        ? query.placeIds.split(",").filter((id) => id.length > 0)
        : undefined;

      const result = await useCase.invoke({
        userId,
        actionType: query.actionType,
        placeIds,
        limit: query.limit,
        offset: query.offset,
      });

      return c.json({
        actions: result.actions.map((item) => ({
          ...item.userAction.toJson(),
          place: item.place,
        })),
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      });
    }
  );
