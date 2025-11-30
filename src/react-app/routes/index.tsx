import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    if (!context.accessToken) {
      throw redirect({ to: "/auth/sign-in", replace: true });
    }
    // throw redirect({ to: "/my-page", replace: true });
  },
});
