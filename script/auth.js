import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(
    {},
    {
      provider: "sqlite",
      usePlural: true,
    }
  ),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.VITE_GOOGLE_CLIENT_ID,
      clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET,
    },
  },
});

export default auth;

// npx @better-auth/cli@latest generate --config ./script/auth.js --output ./src/worker/db/auth.ts
