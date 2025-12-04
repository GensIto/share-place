import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthForm } from "@/react-app/components/AuthForm";

export const Route = createFileRoute("/auth/sign-up")({
  component: Signup,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/", replace: true });
    }
  },
});

function Signup() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <AuthForm mode='sign-up' />
    </div>
  );
}
