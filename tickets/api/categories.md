# Categories API

カテゴリ管理に関する API 群

---

## 1. カテゴリ一覧取得

ログインユーザーのカテゴリ一覧を取得

### エンドポイント
```
GET /api/categories
```

### 認証
要認証（Better Auth）

### レスポンス (200 OK)
```json
{
  "categories": [
    {
      "categoryId": "cat_xxx",
      "name": "カフェ",
      "emoji": "☕",
      "displayOrder": 0,
      "collectionCount": 3,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "categoryId": "cat_yyy",
      "name": "レストラン",
      "emoji": "🍽️",
      "displayOrder": 1,
      "collectionCount": 5,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalCount": 2
}
```

### 処理フロー
1. 認証情報からユーザーID取得
2. categories テーブルから displayOrder 順で取得
3. 各カテゴリに紐づくコレクション数をカウント
4. レスポンス返却

### 実装ファイル
- Controller: `src/worker/controller/CategoriesRoutes.ts`
- UseCase: `src/worker/usecase/GetCategoriesUseCase.ts`

---

## 2. カテゴリ追加

新規カテゴリを作成

### エンドポイント
```
POST /api/categories
```

### 認証
要認証（Better Auth）

### リクエスト
```json
{
  "name": "カフェ",
  "emoji": "☕"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | Yes | カテゴリ名（1-50文字） |
| emoji | string | No | 絵文字（1文字） |

### レスポンス (201 Created)
```json
{
  "categoryId": "cat_xxx",
  "name": "カフェ",
  "emoji": "☕",
  "displayOrder": 3,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### エラー
| コード | 説明 |
|--------|------|
| INVALID_NAME | カテゴリ名は1〜50文字で入力してください |
| DUPLICATE_NAME | 同じ名前のカテゴリが既に存在します |

### 処理フロー
1. リクエストバリデーション
2. 同名カテゴリの重複チェック（同じユーザー内で）
3. categoryId を生成
4. displayOrder を計算（既存の最大値 + 1）
5. categories テーブルに INSERT

### 実装ファイル
- Controller: `src/worker/controller/CategoriesRoutes.ts`
- UseCase: `src/worker/usecase/CreateCategoryUseCase.ts`

---

## 3. カテゴリ削除

カテゴリを削除（紐づくコレクションの categoryId は null になる）

### エンドポイント
```
DELETE /api/categories/:categoryId
```

### 認証
要認証（Better Auth）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| categoryId | string | カテゴリID |

### レスポンス (204 No Content)
レスポンスボディなし

### エラー
| コード | 説明 |
|--------|------|
| CATEGORY_NOT_FOUND | カテゴリが見つかりません |
| FORBIDDEN | このカテゴリを削除する権限がありません |

### 処理フロー
1. categoryId バリデーション
2. categories テーブルから取得
3. 所有者チェック
4. categories テーブルから DELETE
5. 紐づくコレクションの categoryId は ON DELETE SET NULL で自動的に null に

### 実装ファイル
- Controller: `src/worker/controller/CategoriesRoutes.ts`
- UseCase: `src/worker/usecase/DeleteCategoryUseCase.ts`

---

## 使用テーブル
- `categories` - カテゴリ
- `collections` - コレクション数カウント用 / categoryId が SET NULL される

## Repository
- `src/worker/infrastructure/repository/CategoryRepository.ts`

## 備考
- カテゴリ削除時、紐づくコレクションは削除されない（categoryId が null になるだけ）
- 同名カテゴリは禁止（ユーザー単位でユニーク）
- カテゴリ数の上限を設ける場合は要検討（例: 20個まで）
