import { ApiType } from "../../worker/index";
import { hc } from "hono/client";
import { getIdToken } from "./firebaseAuth";

/**
 * Firebase認証トークン付きHonoクライアントを作成
 */
export function createAuthenticatedClient() {
  const client = hc<ApiType>("/", {
    fetch: async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const token = await getIdToken();

      const headers = new Headers(init?.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return fetch(input, {
        ...init,
        headers,
      });
    },
  });

  return client;
}

// デフォルトクライアント（認証トークン付き）
export const client = createAuthenticatedClient();
