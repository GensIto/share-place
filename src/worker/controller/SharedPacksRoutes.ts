import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { SharedPackRepository } from "../infrastructure/repository/SharedPackRepository";
import { PlaceRepository } from "../infrastructure/repository/PlaceRepository";
import { CreateSharedPackUseCase } from "../usecase/sharedPacks/CreateSharedPackUseCase";
import { GetSharedPackUseCase } from "../usecase/sharedPacks/GetSharedPackUseCase";
import { GetMySharedPacksUseCase } from "../usecase/sharedPacks/GetMySharedPacksUseCase";
import { requireAuth } from "../middleware";
import { GooglePlacesService } from "../infrastructure/service/GooglePlacesService";
import * as schema from "../db/schema";

type Env = {
  Bindings: { DB: D1Database } & Cloudflare.Env;
  Variables: {
    sharedPackRepository: SharedPackRepository;
    placeRepository: PlaceRepository;
    userId: string;
  };
};

const factory = createFactory<Env>();

const injectRepositories = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const sharedPackRepository = new SharedPackRepository(database);
  const placeRepository = new PlaceRepository(database);
  c.set("sharedPackRepository", sharedPackRepository);
  c.set("placeRepository", placeRepository);
  await next();
});

const createSharedPackSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内です"),
  message: z
    .string()
    .max(500, "メッセージは500文字以内です")
    .nullable()
    .optional(),
  items: z
    .array(
      z.object({
        placeId: z.string().min(1),
        publicComment: z
          .string()
          .max(300, "コメントは300文字以内です")
          .nullable()
          .optional(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .min(1, "1件以上のアイテムを選択してください"),
});

const getMySharedPacksQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

export const sharedPacksRoutes = new Hono<Env>()

  .get(
    "/",
    injectRepositories,
    requireAuth,
    zValidator("query", getMySharedPacksQuerySchema),
    async (c) => {
      const { limit, offset } = c.req.valid("query");
      const userId = c.get("userId");
      const sharedPackRepository = c.get("sharedPackRepository");

      const baseUrl = new URL(c.req.url).origin;
      const useCase = new GetMySharedPacksUseCase(
        sharedPackRepository,
        baseUrl
      );

      const result = await useCase.invoke({ userId, limit, offset });

      return c.json(result);
    }
  )

  .post(
    "/",
    injectRepositories,
    requireAuth,
    zValidator("json", createSharedPackSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const sharedPackRepository = c.get("sharedPackRepository");
      const placeRepository = c.get("placeRepository");

      const baseUrl = new URL(c.req.url).origin;
      const useCase = new CreateSharedPackUseCase(
        sharedPackRepository,
        placeRepository,
        baseUrl
      );

      const result = await useCase.invoke({
        userId,
        title: input.title,
        message: input.message ?? null,
        items: input.items,
      });

      return c.json(result, 201);
    }
  )

  .get(
    "/:shareToken",
    injectRepositories,
    zValidator(
      "param",
      z.object({
        shareToken: z.string().min(1).max(64),
      })
    ),
    async (c) => {
      const { shareToken } = c.req.valid("param");
      const sharedPackRepository = c.get("sharedPackRepository");

      const googlePlacesApiKey = c.env.VITE_GOOGLE_MAPS_PLATFORM_SECRET;
      if (!googlePlacesApiKey) {
        return c.json(
          {
            error: "CONFIG_ERROR",
            message: "Google Places API key is not configured",
          },
          500
        );
      }

      const googlePlacesService = new GooglePlacesService(googlePlacesApiKey);
      const useCase = new GetSharedPackUseCase(
        sharedPackRepository,
        googlePlacesService
      );

      const result = await useCase.invoke(shareToken);

      return c.json(result);
    }
  );
