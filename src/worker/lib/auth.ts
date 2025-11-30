import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../db/schema";
import { DrizzleD1Database } from "drizzle-orm/d1";

// Better Authインスタンスのキャッシュ
// WeakMapを使用することで、D1Databaseが不要になれば自動的にGCされる
const authCache = new WeakMap<
  DrizzleD1Database<typeof schema>,
  ReturnType<typeof betterAuth>
>();

export const createAuth = (
  db: DrizzleD1Database<typeof schema>,
  env: Cloudflare.Env
) => {
  // キャッシュから取得を試みる
  const cached = authCache.get(db);
  if (cached) {
    return cached;
  }

  // 新しいインスタンスを作成してキャッシュに保存
  const auth = betterAuth({
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.VITE_GOOGLE_CLIENT_ID as string,
        clientSecret: env.VITE_GOOGLE_CLIENT_SECRET as string,
      },
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      schema: {
        ...schema,
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },
  });
  authCache.set(db, auth);
  return auth;
};
