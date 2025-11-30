import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./lib/router";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient } from "./lib/query";
import { authClient } from "./lib/betterAuth";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { Link } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const session = authClient.useSession();

  if (session.isPending) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthUIProvider
        authClient={authClient}
        navigate={(href) => router.navigate({ to: href })}
        Link={({ href, className, children }) => (
          <Link to={href} className={className}>
            {children}
          </Link>
        )}
        social={{
          providers: ["google"],
        }}
      >
        <RouterProvider
          router={router}
          context={{ accessToken: session.data?.session?.token }}
        />
      </AuthUIProvider>
    </QueryClientProvider>
  );
}
