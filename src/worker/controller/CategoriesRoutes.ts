import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import { z } from "zod";
import { CategoryRepository } from "../infrastructure/repository/CategoryRepository";
import {
  GetCategoriesUseCase,
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
} from "../usecase/categories";
import * as schema from "../db/schema";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware";

type Env = {
  Bindings: { DB: D1Database } & Cloudflare.Env;
  Variables: {
    categoryRepository: CategoryRepository;
    userId: string;
  };
};

const factory = createFactory<Env>();

const injectCategoryRepository = factory.createMiddleware(async (c, next) => {
  const database = drizzle(c.env.DB, { schema });
  const categoryRepository = new CategoryRepository(database);
  c.set("categoryRepository", categoryRepository);
  await next();
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  emoji: z.string().nullable().optional(),
});

export const categoriesRoutes = new Hono<Env>()
  .get("/", injectCategoryRepository, requireAuth, async (c) => {
    const userId = c.get("userId");
    const categoryRepository = c.get("categoryRepository");
    const useCase = new GetCategoriesUseCase(categoryRepository);

    const result = await useCase.invoke(userId);

    return c.json({
      categories: result.categories.map((item) => ({
        ...item.category.toJson(),
        collectionCount: item.collectionCount,
      })),
      totalCount: result.totalCount,
    });
  })

  .post(
    "/",
    injectCategoryRepository,
    requireAuth,
    zValidator("json", createCategorySchema),
    async (c) => {
      const userId = c.get("userId");
      const input = c.req.valid("json");
      const categoryRepository = c.get("categoryRepository");
      const useCase = new CreateCategoryUseCase(categoryRepository);

      try {
        const result = await useCase.invoke({
          userId,
          name: input.name,
          emoji: input.emoji,
        });

        return c.json(result.category.toJson(), 201);
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

  .delete(
    "/:categoryId",
    injectCategoryRepository,
    requireAuth,
    zValidator(
      "param",
      z.object({
        categoryId: z.uuid(),
      })
    ),
    async (c) => {
      const userId = c.get("userId");
      const { categoryId } = c.req.valid("param");
      const categoryRepository = c.get("categoryRepository");
      const useCase = new DeleteCategoryUseCase(categoryRepository);

      try {
        await useCase.invoke({ categoryId, userId });
        return c.body(null, 204);
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
  );
