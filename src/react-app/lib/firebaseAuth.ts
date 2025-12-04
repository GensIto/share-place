import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
} from "firebase/auth";

// Firebase設定（環境変数から取得）
// 最小限の設定: projectIdとapiKeyがあれば動作します
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!projectId || !apiKey) {
  throw new Error(
    "Firebase設定が不足しています。VITE_FIREBASE_PROJECT_IDとVITE_FIREBASE_API_KEYを設定してください。"
  );
}

const firebaseConfig = {
  apiKey,
  projectId,
  authDomain: `${projectId}.firebaseapp.com`,
  storageBucket: `${projectId}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebaseアプリの初期化（既に初期化されている場合は再利用）
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Authインスタンスの取得
export const auth: Auth = getAuth(app);

/**
 * 匿名認証でサインイン
 */
export async function signInAnonymouslyAuth(): Promise<User> {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
}

/**
 * メールアドレスとパスワードでサインイン
 * Firebase公式ドキュメントに準拠: https://firebase.google.com/docs/auth/web/start
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    // Firebase公式のエラーハンドリングパターンに準拠
    // https://firebase.google.com/docs/auth/web/start#handle_errors
    const authError = error as AuthError;
    const errorCode = authError.code;
    const errorMessage = authError.message;
    throw new Error(`サインインに失敗しました: ${errorCode} - ${errorMessage}`);
  }
}

/**
 * メールアドレスとパスワードでサインアップ
 * Firebase公式ドキュメントに準拠: https://firebase.google.com/docs/auth/web/start
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    // Firebase公式のエラーハンドリングパターンに準拠
    // https://firebase.google.com/docs/auth/web/start#handle_errors
    const authError = error as AuthError;
    const errorCode = authError.code;
    const errorMessage = authError.message;
    throw new Error(
      `アカウント作成に失敗しました: ${errorCode} - ${errorMessage}`
    );
  }
}

/**
 * Googleでサインイン
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  // Google認証後、ユーザー情報が完全に読み込まれるまで少し待つ
  // displayNameやphotoURLが非同期で設定される可能性があるため
  if (!user.displayName || !user.photoURL) {
    await user.reload();
  }

  return user;
}

/**
 * サインアウト
 */
export async function signOutAuth(): Promise<void> {
  await signOut(auth);
}

/**
 * 認証状態の変更を監視
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * 現在のユーザーを取得
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * IDトークンを取得（APIリクエスト用）
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return await user.getIdToken(forceRefresh);
}

/**
 * ユーザーが匿名ユーザーかどうかを判定
 */
export function isAnonymousUser(user: User | null): boolean {
  return user?.isAnonymous ?? false;
}
