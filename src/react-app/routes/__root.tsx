import { Button } from "@/components/ui/button";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouteContext,
} from "@tanstack/react-router";
import { signOutAuth } from "@/react-app/lib/firebaseAuth";

const RootLayout = () => {
  const router = useRouter();
  const { user, isAnonymous } = useRouteContext({ from: "__root__" });

  const handleSignOut = async () => {
    await signOutAuth();
    router.invalidate();
    router.navigate({ to: "/auth/sign-in" });
  };

  return (
    <>
      <div className='p-2 flex gap-2'>
        <div className='flex items-center justify-between w-full'>
          <Link to='/' className='[&.active]:font-bold'>
            <div className='flex items-center gap-2'>
              <h1 className='text-base leading-6 text-foreground'>Home</h1>
            </div>
          </Link>
          {user && (
            <div className='flex items-center gap-2'>
              {isAnonymous && (
                <span className='text-sm text-muted-foreground'>
                  匿名ユーザー
                </span>
              )}
              {user.email && (
                <span className='text-sm text-muted-foreground'>
                  {user.email}
                </span>
              )}
              <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
          )}
        </div>
      </div>
      <hr />
      <div className='py-6 px-8'>
        <Outlet />
      </div>
    </>
  );
};

export const Route = createRootRouteWithContext<{
  user?: import("firebase/auth").User | null;
  idToken?: string | null;
  isAnonymous?: boolean;
}>()({
  component: RootLayout,
});
