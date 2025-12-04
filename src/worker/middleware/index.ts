import { createFactory } from "hono/factory";
import {
  verifyFirebaseToken,
  getFirebaseTokenFromRequest,
  isAnonymousUser,
} from "../lib/firebaseAuth";

const factory = createFactory<{
  Bindings: Cloudflare.Env;
  Variables: {
    userId?: string;
    isAnonymous?: boolean;
  };
}>();

/**
 * 匿名認証も許可するミドルウェア
 * 認証情報があれば設定し、なければスキップ
 */
export const optionalAuth = factory.createMiddleware(async (c, next) => {
  const token = getFirebaseTokenFromRequest(c.req.raw.headers);

  if (token) {
    try {
      const projectId = c.env.FIREBASE_PROJECT_ID;
      if (!projectId) {
        console.warn("FIREBASE_PROJECT_ID is not set");
        await next();
        return;
      }

      const payload = await verifyFirebaseToken(token, projectId);
      c.set("userId", payload.uid);
      c.set("isAnonymous", isAnonymousUser(payload));
    } catch (error) {
      console.warn("Token verification failed:", error);
      // 検証に失敗しても続行（匿名利用を許可）
    }
  }

  await next();
});

/**
 * 認証を必須とするミドルウェア（匿名認証も許可）
 */
export const requireAuth = factory.createMiddleware(async (c, next) => {
  const token = getFirebaseTokenFromRequest(c.req.raw.headers);

  if (!token) {
    return c.json({ error: "UNAUTHORIZED", message: "認証が必要です" }, 401);
  }

  try {
    const projectId = c.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      return c.json(
        { error: "CONFIG_ERROR", message: "Firebase設定が不正です" },
        500
      );
    }

    const payload = await verifyFirebaseToken(token, projectId);
    c.set("userId", payload.uid);
    c.set("isAnonymous", isAnonymousUser(payload));
  } catch (error) {
    return c.json(
      {
        error: "UNAUTHORIZED",
        message: `認証トークンの検証に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
      },
      401
    );
  }

  await next();
});

/**
 * 登録済みユーザーのみ許可するミドルウェア（匿名ユーザーは拒否）
 */
export const requireRegisteredAuth = factory.createMiddleware(
  async (c, next) => {
    const token = getFirebaseTokenFromRequest(c.req.raw.headers);

    if (!token) {
      return c.json({ error: "UNAUTHORIZED", message: "認証が必要です" }, 401);
    }

    try {
      const projectId = c.env.FIREBASE_PROJECT_ID;
      if (!projectId) {
        return c.json(
          { error: "CONFIG_ERROR", message: "Firebase設定が不正です" },
          500
        );
      }

      const payload = await verifyFirebaseToken(token, projectId);

      // 匿名ユーザーを拒否
      if (isAnonymousUser(payload)) {
        return c.json(
          {
            error: "FORBIDDEN",
            message: "この機能を利用するにはユーザー登録が必要です",
          },
          403
        );
      }

      c.set("userId", payload.uid);
      c.set("isAnonymous", false);
    } catch (error) {
      return c.json(
        {
          error: "UNAUTHORIZED",
          message: `認証トークンの検証に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        },
        401
      );
    }

    await next();
  }
);
