import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { PlaceRepository } from "../infrastructure/repository/PlaceRepository";
import { UserActionRepository } from "../infrastructure/repository/UserActionRepository";
import { UpsertPlaceUseCase } from "../usecase/places/UpsertPlaceUseCase";
import { GetPlaceDetailUseCase } from "../usecase/places/GetPlaceDetailUseCase";
import { SearchPlacesNearbyUseCase } from "../usecase/places/SearchPlacesNearbyUseCase";
import { SearchPlacesWithAiUseCase } from "../usecase/places/SearchPlacesWithAiUseCase";
import { GooglePlacesService } from "../infrastructure/service/GooglePlacesService";
import { GeminiService } from "../infrastructure/service/GeminiService";
import { requireAuth } from "../middleware";
import * as schema from "../db/schema";

type Env = {
  Bindings: { DB: D1Database } & Cloudflare.Env;
  Variables: {
    placeRepository: PlaceRepository;
    userActionRepository: UserActionRepository;
    userId: string;
  };
};

const factory = createFactory<Env>();

const injectRepositories = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const placeRepository = new PlaceRepository(database);
  const userActionRepository = new UserActionRepository(database);
  c.set("placeRepository", placeRepository);
  c.set("userActionRepository", userActionRepository);
  await next();
});

export const upsertPlaceSchema = z.object({
  placeId: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  details: z
    .object({
      name: z.string().min(1),
      address: z.string().nullable().optional(),
      cachedImageUrl: z.url().nullable().optional(),
      rating: z.number().min(0).max(5).nullable().optional(),
      reviewCount: z.number().int().min(0).nullable().optional(),
      priceLevel: z.number().int().min(0).max(4).nullable().optional(),
      categoryTag: z.string().nullable().optional(),
      rawJson: z.string().nullable().optional(),
    })
    .optional(),
});

const searchNearbySchema = z.object({
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  radius: z.number().min(1).max(50000).optional().default(1000),
  type: z.string().optional(),
  keyword: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional().default(20),
});

const searchAiSchema = z.object({
  query: z.string().min(1).max(500),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  radius: z.number().min(1).max(50000).optional().default(5000),
  limit: z.number().int().min(1).max(20).optional().default(20),
});

export const placesRoutes = new Hono<Env>()
  .post(
    "/search/nearby",
    injectRepositories,
    requireAuth,
    zValidator("json", searchNearbySchema),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const placeRepository = c.get("placeRepository");
      const userActionRepository = c.get("userActionRepository");

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
      const useCase = new SearchPlacesNearbyUseCase(
        placeRepository,
        userActionRepository,
        googlePlacesService
      );

      const result = await useCase.invoke({
        userId,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        radius: input.radius,
        type: input.type,
        keyword: input.keyword,
        limit: input.limit,
      });

      return c.json(result);
    }
  )

  .post(
    "/search/ai",
    injectRepositories,
    requireAuth,
    zValidator("json", searchAiSchema),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");
      const placeRepository = c.get("placeRepository");
      const userActionRepository = c.get("userActionRepository");

      const googlePlacesApiKey = c.env.VITE_GOOGLE_MAPS_PLATFORM_SECRET;
      const geminiApiKey = c.env.VITE_GOOGLE_GEMINI_SECRET;

      if (!googlePlacesApiKey || !geminiApiKey) {
        return c.json(
          { error: "CONFIG_ERROR", message: "API keys are not configured" },
          500
        );
      }

      const googlePlacesService = new GooglePlacesService(googlePlacesApiKey);
      const geminiService = new GeminiService(geminiApiKey);
      const useCase = new SearchPlacesWithAiUseCase(
        placeRepository,
        userActionRepository,
        googlePlacesService,
        geminiService
      );

      const result = await useCase.invoke({
        userId,
        query: input.query,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        radius: input.radius,
        limit: input.limit,
      });

      return c.json(result);
    }
  )

  .post(
    "/",
    injectRepositories,
    zValidator("json", upsertPlaceSchema),
    async (c) => {
      const input = c.req.valid("json");
      const placeRepository = c.get("placeRepository");
      const useCase = new UpsertPlaceUseCase(placeRepository);

      const result = await useCase.invoke(input);

      return c.json(
        {
          ...result.place.toJson(),
          ...(result.details && {
            ...result.details.toJson(),
          }),
        },
        result.isNew ? 201 : 200
      );
    }
  )

  .get(
    "/:placeId",
    injectRepositories,
    zValidator(
      "param",
      z.object({
        placeId: z.string().min(1).max(255),
      })
    ),
    zValidator(
      "query",
      z.object({
        refresh: z
          .string()
          .optional()
          .transform((val) => val === "true"),
      })
    ),
    async (c) => {
      const { placeId } = c.req.valid("param");
      const { refresh } = c.req.valid("query");
      const placeRepository = c.get("placeRepository");
      const useCase = new GetPlaceDetailUseCase(placeRepository);

      // TODO: If refresh is true, fetch from Google Places API
      // For now, just return from cache
      if (refresh) {
        // Future: Call Google Places API and update cache
      }

      const result = await useCase.invoke(placeId);

      if (!result) {
        return c.json(
          { error: "PLACE_NOT_FOUND", message: "Place not found" },
          404
        );
      }

      return c.json({
        ...result.place.toJson(),
        ...(result.details && {
          ...result.details.toJson(),
        }),
      });
    }
  );
