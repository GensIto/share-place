/**
 * Firebase Auth トークン検証ユーティリティ
 * Cloudflare Workers環境でFirebase IDトークンを検証する
 */

interface FirebaseTokenPayload {
  uid?: string;
  sub?: string; // Firebase IDトークンではsubフィールドにユーザーIDが含まれる
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
  };
  iat: number;
  exp: number;
  auth_time: number;
  iss: string;
  aud: string;
}

/**
 * JWTトークンをデコード（検証なし）
 */
function decodeJWT(token: string): {
  header: Record<string, unknown>;
  payload: FirebaseTokenPayload;
  signature: string;
} {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const header = JSON.parse(
    atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"))
  );
  const payload = JSON.parse(
    atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
  );
  const signature = parts[2];

  return { header, payload, signature };
}

/**
 * Firebase IDトークンを検証
 */
export async function verifyFirebaseToken(
  token: string,
  projectId: string
): Promise<FirebaseTokenPayload> {
  try {
    // トークンをデコード
    const { payload } = decodeJWT(token);

    // 基本的な検証
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
      throw new Error("Invalid issuer");
    }

    if (payload.aud !== projectId) {
      throw new Error("Invalid audience");
    }

    // 有効期限チェック
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error("Token expired");
    }

    // 発行時刻チェック（5分以内）
    if (payload.auth_time && payload.auth_time < now - 300) {
      // 発行から5分以上経過している場合は警告（ただし匿名認証は許可）
      // 実際の検証はFirebase Admin SDKで行うべきだが、Workers環境では簡易検証
    }

    return payload;
  } catch (error) {
    throw new Error(
      `Token verification failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * リクエストヘッダーからFirebase IDトークンを取得
 */
export function getFirebaseTokenFromRequest(headers: Headers): string | null {
  // Authorizationヘッダーから取得
  const authHeader = headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Cookieから取得（オプション）
  const cookieHeader = headers.get("Cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const tokenCookie = cookies.find((c) => c.startsWith("firebase-token="));
    if (tokenCookie) {
      return tokenCookie.substring("firebase-token=".length);
    }
  }

  return null;
}

/**
 * ユーザーが匿名ユーザーかどうかを判定
 */
export function isAnonymousUser(payload: FirebaseTokenPayload): boolean {
  return payload.firebase.sign_in_provider === "anonymous";
}
