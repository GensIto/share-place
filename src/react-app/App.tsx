import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./lib/router";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient } from "./lib/query";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  onAuthStateChange,
  getIdToken,
  isAnonymousUser,
} from "./lib/firebaseAuth";
import { Toaster } from "sonner";
import type { User } from "firebase/auth";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const savedUserIdsRef = useRef<Set<string>>(new Set());

  // ユーザー情報をDBに保存
  const saveUserToDatabase = useCallback(
    async (user: User, retryCount = 0): Promise<void> => {
      // 既に保存済みの場合はスキップ
      if (savedUserIdsRef.current.has(user.uid)) {
        return;
      }

      try {
        // IDトークンを取得（リトライ時は強制リフレッシュ）
        const token = await getIdToken(retryCount > 0);
        if (!token) {
          // トークンが取得できない場合は少し待ってからリトライ
          if (retryCount < 3) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return saveUserToDatabase(user, retryCount + 1);
          }
          console.warn("Failed to get ID token after retries");
          return;
        }

        // Google認証の場合、displayNameやphotoURLが非同期で読み込まれる可能性がある
        // そのため、少し待ってから再取得を試みる
        let displayName = user.displayName;
        let photoURL = user.photoURL;

        if (!displayName || !photoURL) {
          // ユーザー情報の再読み込みを試みる
          await user.reload();
          displayName = user.displayName;
          photoURL = user.photoURL;
        }

        // Honoクライアントを使用してAPIを呼び出し
        const response = await fetch("/api/users/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.uid,
            name: displayName || user.email?.split("@")[0] || "Anonymous User",
            email: user.email,
            image: photoURL,
            isAnonymous: user.isAnonymous,
            emailVerified: user.emailVerified,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to save user: ${response.status} ${errorText}`
          );
        }

        // 保存済みとしてマーク
        savedUserIdsRef.current.add(user.uid);
        console.log("User saved to database:", user.uid);
      } catch (error) {
        console.error("Failed to save user to database:", error);
        // リトライ可能な場合は再試行
        if (
          retryCount < 2 &&
          error instanceof Error &&
          error.message.includes("token")
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return saveUserToDatabase(user, retryCount + 1);
        }
        // エラーが発生してもアプリの動作は続行
      }
    },
    []
  );

  useEffect(() => {
    // 認証状態の変更を監視
    // onAuthStateChangedは初期状態も含めて呼び出されるため、
    // 別途getCurrentUser()を呼ぶ必要はありません
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        try {
          const token = await getIdToken();
          setIdToken(token);

          // ログイン後にユーザー情報をDBに保存
          await saveUserToDatabase(user);
        } catch (error) {
          console.error("Failed to get ID token:", error);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
        // ログアウト時は保存済みリストをクリア
        savedUserIdsRef.current.clear();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [saveUserToDatabase]);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={{
          user,
          idToken,
          isAnonymous: isAnonymousUser(user),
        }}
      />
      <Toaster />
    </QueryClientProvider>
  );
}
