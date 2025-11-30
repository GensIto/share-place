import { routeTree } from "../routeTree";
import { createRouter } from "@tanstack/react-router";

export const router = createRouter({
  routeTree,
  context: {
    accessToken: undefined,
  },
});
