# SpotMatch

Google Maps の場所データと Gemini AI を組み合わせた、**Tinderライクな直感操作で「行きたい場所」を探せる PWA**。

写真と雰囲気（Vibe）でスワイプして、お気に入りの場所をコレクション。友人とカードパックとしてシェアできます。

## コアコンセプト

- **Vibe First** - スペックより写真と直感で選ぶ
- **Swipe to Save** - 右スワイプで保存、左でスキップ
- **Curated Sharing** - 友人のために選んだ「カードパック」としてシェア

## 技術スタック

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | React 19, TypeScript, Tailwind CSS, Framer Motion |
| Backend  | Cloudflare Workers, Hono                          |
| Database | Cloudflare D1 (SQLite), Drizzle ORM               |
| Auth     | Firebase Authentication                           |
| AI       | Google Gemini 2.5 Flash + Google Maps Grounding   |
| PWA      | vite-plugin-pwa                                   |

## 主要機能

### デュアルモード検索

- **AI Pick**: 「静かで読書ができるカフェ」などの抽象的なVibeをGeminiが解釈
- **Map Search**: 「スターバックス 渋谷」など具体的な固有名詞で検索

### カードスワイプ UI

- Framer Motionによる物理演算ベースのスワイプ
- 写真・店舗名・評価・価格帯・カテゴリを表示
- タップで詳細モーダル（営業状況、Google Mapsリンク、メモ機能）

### マイコレクション

- 自動分類（カフェ、サウナ等）+ カスタムタブ作成

### ソーシャル共有

- Web Share API（LINE, AirDrop等）でシェア
- 動的OGP生成によるプレビュー表示

## セットアップ

```bash
npm install
npm run dev
```

### 環境変数の設定

Firebase Authenticationを使用するため、以下の**最小限の**環境変数を設定してください：

#### フロントエンド（`.env.local`）

`.env.example`をコピーして`.env.local`を作成し、Firebase Consoleから取得した値を設定してください：

```bash
cp .env.example .env.local
```

**Firebase Consoleの設定値との対応関係：**

Firebase Consoleの「プロジェクトの設定」→「全般」タブに表示される6つの設定値のうち、**最低限必要なのは2つだけ**です：

| Firebase Consoleの設定値 | 環境変数名                          | 必須/オプション | 説明                                                    |
| ------------------------ | ----------------------------------- | --------------- | ------------------------------------------------------- |
| **1. apiKey**            | `VITE_FIREBASE_API_KEY`             | **必須**        | Firebase APIキー（`AIzaSy...`で始まる）                 |
| 2. authDomain            | `VITE_FIREBASE_AUTH_DOMAIN`         | オプション      | 自動的に`{projectId}.firebaseapp.com`として推測されます |
| **3. projectId**         | `VITE_FIREBASE_PROJECT_ID`          | **必須**        | FirebaseプロジェクトID                                  |
| 4. storageBucket         | `VITE_FIREBASE_STORAGE_BUCKET`      | オプション      | 認証のみ使用する場合は不要                              |
| 5. messagingSenderId     | `VITE_FIREBASE_MESSAGING_SENDER_ID` | オプション      | 認証のみ使用する場合は不要                              |
| 6. appId                 | `VITE_FIREBASE_APP_ID`              | オプション      | 認証のみ使用する場合は不要                              |

**最小限の設定例（`.env.local`ファイル）：**

```bash
# Firebase Consoleの「プロジェクトの設定」→「全般」タブから取得
# 設定値の「3. projectId」をコピー
VITE_FIREBASE_PROJECT_ID=my-project-12345

# 設定値の「1. apiKey」をコピー
VITE_FIREBASE_API_KEY=AIzaSy...
```

これだけで動作します！他の4つの設定値は不要です。

#### バックエンド（Wrangler secrets）

```bash
wrangler secret put FIREBASE_PROJECT_ID
```

**注意**: フロントエンドでは`VITE_FIREBASE_PROJECT_ID`と`VITE_FIREBASE_API_KEY`のみで動作します。`authDomain`は自動的に`{projectId}.firebaseapp.com`として推測されます。

### Firebaseプロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authenticationを有効化し、以下の認証方法を有効にする：
   - 匿名認証
   - メール/パスワード認証
   - Google認証（オプション）
3. Firebase設定からWebアプリを追加し、設定値を取得

## コマンド

```bash
# 開発
npm run dev              # 開発サーバー起動

# ビルド・デプロイ
npm run build            # TypeScript + Vite ビルド
npm run check            # 全検証（tsc + build + deploy dry-run）
npm run deploy           # Cloudflare Workers へデプロイ

# Lint・テスト
npm run lint             # ESLint
npm run test             # Vitest 実行

# データベース
npm run db:gen           # マイグレーション生成
npm run db:migrate       # ローカルD1に適用
npm run db:migrate:remote # 本番D1に適用
npm run db:studio        # Drizzle Studio 起動
```

## アーキテクチャ

```
src/
├── react-app/           # React フロントエンド
│   ├── routes/          # TanStack Router (ファイルベース)
│   └── lib/             # API client, auth, query
├── worker/              # Hono バックエンド (Edge)
│   ├── controller/      # HTTP ルート
│   ├── usecase/         # ビジネスロジック
│   ├── domain/          # エンティティ・値オブジェクト
│   ├── infrastructure/  # リポジトリ実装
│   └── db/              # Drizzle スキーマ
├── components/          # 共有UIコンポーネント
└── lib/                 # 共通ユーティリティ
```

### OGP / シェア機能

SNSシェア時のプレビュー表示のため、Honoで動的OGPを生成:

- `/share/:id` へのアクセスをWorkerがインターセプト
- ボットにはOGP情報、人間にはReactアプリを返すハイブリッド構成
