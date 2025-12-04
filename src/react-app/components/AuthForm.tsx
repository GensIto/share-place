import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  signInWithGoogle,
  signInAnonymouslyAuth,
} from "@/react-app/lib/firebaseAuth";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("サインインしました");
      router.invalidate();
      router.navigate({ to: "/" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "認証に失敗しました";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousAuth = async () => {
    setLoading(true);
    try {
      await signInAnonymouslyAuth();
      toast.success("匿名ユーザーとしてサインインしました");
      router.invalidate();
      router.navigate({ to: "/" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "認証に失敗しました";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md space-y-6'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>
          {mode === "sign-in" ? "サインイン" : "サインアップ"}
        </h1>
        <p className='text-muted-foreground mt-2'>
          {mode === "sign-in"
            ? "アカウントにサインインしてください"
            : "新しいアカウントを作成してください"}
        </p>
      </div>

      <div className='space-y-4'>
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          Googleでサインイン
        </Button>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              または
            </span>
          </div>
        </div>

        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleAnonymousAuth}
          disabled={loading}
        >
          匿名ユーザーとして続ける
        </Button>
      </div>
    </div>
  );
}
