import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthForm } from "@/react-app/components/AuthForm";

export const Route = createFileRoute("/auth/sign-in")({
  component: Signin,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/", replace: true });
    }
  },
});

function Signin() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <AuthForm mode='sign-in' />
    </div>
  );
}
