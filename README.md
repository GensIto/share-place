# SpotMatch

Google Maps の場所データと Gemini AI を組み合わせた、**Tinderライクな直感操作で「行きたい場所」を探せる PWA**。

写真と雰囲気（Vibe）でスワイプして、お気に入りの場所をコレクション。友人とカードパックとしてシェアできます。

## コアコンセプト

- **Vibe First** - スペックより写真と直感で選ぶ
- **Swipe to Save** - 右スワイプで保存、左でスキップ
- **Curated Sharing** - 友人のために選んだ「カードパック」としてシェア

## 技術スタック

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Cloudflare Workers, Hono |
| Database | Cloudflare D1 (SQLite), Drizzle ORM |
| Auth | Better Auth |
| AI | Google Gemini 2.5 Flash + Google Maps Grounding |
| PWA | vite-plugin-pwa |

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
