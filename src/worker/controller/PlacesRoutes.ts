import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { PlaceRepository } from "../infrastructure/repository/PlaceRepository";
import { UpsertPlaceUseCase } from "../usecase/places/UpsertPlaceUseCase";
import { GetPlaceDetailUseCase } from "../usecase/places/GetPlaceDetailUseCase";
import * as schema from "../db/schema";

type Env = {
  Bindings: { DB: D1Database };
  Variables: { placeRepository: PlaceRepository };
};

const factory = createFactory<Env>();

const injectPlaceRepository = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const placeRepository = new PlaceRepository(database);
  c.set("placeRepository", placeRepository);
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

export const placesRoutes = new Hono<Env>()
  .post(
    "/",
    injectPlaceRepository,
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
    injectPlaceRepository,
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
