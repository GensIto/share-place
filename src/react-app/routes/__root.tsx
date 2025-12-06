import { Button } from "@/components/ui/button";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouteContext,
} from "@tanstack/react-router";
import { signOutAuth } from "@/react-app/lib/firebaseAuth";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

const RootLayout = () => {
  const router = useRouter();
  const { user, isAnonymous } = useRouteContext({ from: "__root__" });

  const handleSignOut = async () => {
    await signOutAuth();
    router.invalidate();
    router.navigate({ to: "/auth/sign-in" });
  };

  return (
    <main className='min-h-screen bg-gray-800'>
      <div className='p-2 flex gap-2'>
        <div className='flex items-center justify-between w-full max-w-md mx-auto px-2'>
          <Link to='/' className='[&.active]:font-bold'>
            <div className='flex items-center gap-2'>
              <h1 className='text-base leading-6 text-foreground text-white'>
                Home
              </h1>
            </div>
          </Link>
          {user && !isAnonymous && (
            <Button onClick={handleSignOut}>Sign Out</Button>
          )}
        </div>
      </div>
      <hr />
      <div className='max-w-md mx-auto'>
        <NuqsAdapter>
          <Outlet />
        </NuqsAdapter>
      </div>
    </main>
  );
};

export const Route = createRootRouteWithContext<{
  user?: import("firebase/auth").User | null;
  idToken?: string | null;
  isAnonymous?: boolean;
}>()({
  component: RootLayout,
});
