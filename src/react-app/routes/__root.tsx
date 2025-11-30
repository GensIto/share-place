import { Button } from "@/components/ui/button";
import { authClient } from "@/react-app/lib/betterAuth";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";

const RootLayout = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut().then(() => {
      router.invalidate();
      router.navigate({ to: "/auth/sign-in" });
    });
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
          {session?.user?.email && (
            <Button onClick={handleSignOut}>Sign Out</Button>
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
  accessToken?: string;
}>()({
  component: RootLayout,
});
