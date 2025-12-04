import { routeTree } from "../routeTree";
import { createRouter } from "@tanstack/react-router";
import type { User } from "firebase/auth";

export const router = createRouter({
  routeTree,
  context: {
    user: undefined as User | null | undefined,
    idToken: undefined as string | null | undefined,
    isAnonymous: undefined as boolean | undefined,
  },
});
