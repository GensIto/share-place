import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./lib/router";
import { RouterProvider } from "@tanstack/react-router";
import { queryClient } from "./lib/query";
import { useEffect, useState, useRef } from "react";
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
  }, []);

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
