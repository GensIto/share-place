import { AuthView } from "@daveyplate/better-auth-ui";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-in")({
  component: Signin,
  beforeLoad: async ({ context }) => {
    if (context.accessToken) {
      // throw redirect({ to: "/my-page", replace: true });
    }
  },
});

function Signin() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <AuthView pathname='sign-in' />
    </div>
  );
}
