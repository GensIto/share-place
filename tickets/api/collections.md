# Collections API

コレクション管理に関する API 群

---

## 1. コレクション一覧取得

ログインユーザーのコレクション一覧を取得

### エンドポイント
```
GET /api/collections
```

### 認証
要認証（Better Auth）

### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| categoryId | string | No | カテゴリでフィルタ |

### レスポンス (200 OK)
```json
{
  "collections": [
    {
      "collectionId": "col_xxx",
      "name": "行きたいカフェ",
      "categoryId": "cat_xxx",
      "category": {
        "categoryId": "cat_xxx",
        "name": "カフェ",
        "emoji": "☕"
      },
      "displayOrder": 0,
      "isDefault": true,
      "itemCount": 15,
      "thumbnails": [
        "https://...",
        "https://...",
        "https://..."
      ],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalCount": 5
}
```

### 処理フロー
1. 認証情報からユーザーID取得
2. collections テーブルから displayOrder 順で取得
3. 各コレクションのアイテム数をカウント
4. サムネイル用に最初の3件の画像URLを取得
5. カテゴリ情報を結合

### 実装ファイル
- Controller: `src/worker/controller/CollectionsRoutes.ts`
- UseCase: `src/worker/usecase/GetCollectionsUseCase.ts`

---

## 2. コレクション詳細取得

特定のコレクションの詳細と含まれるアイテム一覧を取得

### エンドポイント
```
GET /api/collections/:collectionId
```

### 認証
要認証（Better Auth）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| collectionId | string | コレクションID |

### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| limit | number | No | 取得件数（デフォルト: 50） |
| offset | number | No | オフセット（デフォルト: 0） |

### レスポンス (200 OK)
```json
{
  "collectionId": "col_xxx",
  "name": "行きたいカフェ",
  "categoryId": "cat_xxx",
  "category": {
    "categoryId": "cat_xxx",
    "name": "カフェ",
    "emoji": "☕"
  },
  "displayOrder": 0,
  "isDefault": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "items": [
    {
      "collectionItemId": 1,
      "placeId": "ChIJ...",
      "name": "Cafe Example",
      "address": "東京都渋谷区...",
      "latitude": 35.6595,
      "longitude": 139.7004,
      "cachedImageUrl": "https://...",
      "rating": 4.5,
      "reviewCount": 120,
      "priceLevel": 2,
      "categoryTag": "カフェ",
      "userMemo": "友達のおすすめ",
      "sourceShareToken": null,
      "addedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalItemCount": 15,
  "hasMore": false
}
```

### エラー
| コード | 説明 |
|--------|------|
| COLLECTION_NOT_FOUND | コレクションが見つかりません |
| FORBIDDEN | このコレクションにアクセスする権限がありません |

### 実装ファイル
- Controller: `src/worker/controller/CollectionsRoutes.ts`
- UseCase: `src/worker/usecase/GetCollectionDetailUseCase.ts`

---

## 3. コレクション作成

新規コレクションを作成

### エンドポイント
```
POST /api/collections
```

### 認証
要認証（Better Auth）

### リクエスト
```json
{
  "name": "週末に行きたい場所",
  "categoryId": "cat_xxx"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | Yes | コレクション名（1-100文字） |
| categoryId | string | No | 紐付けるカテゴリID |

### レスポンス (201 Created)
```json
{
  "collectionId": "col_yyy",
  "name": "週末に行きたい場所",
  "categoryId": "cat_xxx",
  "category": {
    "categoryId": "cat_xxx",
    "name": "お出かけ",
    "emoji": "🚗"
  },
  "displayOrder": 5,
  "isDefault": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 処理フロー
1. リクエストバリデーション
2. categoryId が指定されている場合、存在確認 & 所有者チェック
3. collectionId を生成
4. displayOrder を計算（既存の最大値 + 1）
5. collections テーブルに INSERT

### 実装ファイル
- Controller: `src/worker/controller/CollectionsRoutes.ts`
- UseCase: `src/worker/usecase/CreateCollectionUseCase.ts`

---

## 4. コレクション更新

コレクションの名前・カテゴリ・表示順を更新

### エンドポイント
```
PATCH /api/collections/:collectionId
```

### 認証
要認証（Better Auth）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| collectionId | string | コレクションID |

### リクエスト
```json
{
  "name": "新しい名前",
  "categoryId": "cat_yyy",
  "displayOrder": 2
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | No | コレクション名（1-100文字） |
| categoryId | string \| null | No | カテゴリID（null で解除） |
| displayOrder | number | No | 表示順 |

### レスポンス (200 OK)
```json
{
  "collectionId": "col_xxx",
  "name": "新しい名前",
  "categoryId": "cat_yyy",
  "category": {
    "categoryId": "cat_yyy",
    "name": "レストラン",
    "emoji": "🍽️"
  },
  "displayOrder": 2,
  "isDefault": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### エラー
| コード | 説明 |
|--------|------|
| COLLECTION_NOT_FOUND | コレクションが見つかりません |
| FORBIDDEN | このコレクションを編集する権限がありません |
| CANNOT_MODIFY_DEFAULT | デフォルトコレクションの名前は変更できません |

### 実装ファイル
- Controller: `src/worker/controller/CollectionsRoutes.ts`
- UseCase: `src/worker/usecase/UpdateCollectionUseCase.ts`

---

## 5. コレクション削除

コレクションを削除（中のアイテムも cascade 削除）

### エンドポイント
```
DELETE /api/collections/:collectionId
```

### 認証
要認証（Better Auth）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| collectionId | string | コレクションID |

### レスポンス (204 No Content)
レスポンスボディなし

### エラー
| コード | 説明 |
|--------|------|
| COLLECTION_NOT_FOUND | コレクションが見つかりません |
| FORBIDDEN | このコレクションを削除する権限がありません |
| CANNOT_DELETE_DEFAULT | デフォルトコレクションは削除できません |

### 実装ファイル
- Controller: `src/worker/controller/CollectionsRoutes.ts`
- UseCase: `src/worker/usecase/DeleteCollectionUseCase.ts`

---

## 6. アイテム追加

Place をコレクションに追加

### エンドポイント
```
POST /api/collections/:collectionId/items
```

### 認証
要認証（Better Auth）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| collectionId | string | コレクションID |

### リクエスト
```json
{
  "placeId": "ChIJ...",
  "userMemo": "友達のおすすめ",
  "sourceShareToken": "abc123xyz"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| placeId | string | Yes | Google Place ID |
| userMemo | string | No | ユーザーメモ（500文字以内） |
| sourceShareToken | string | No | 共有パックから追加した場合のトークン |

### レスポンス (201 Created)
```json
{
  "collectionItemId": 123,
  "collectionId": "col_xxx",
  "placeId": "ChIJ...",
  "place": {
    "name": "Cafe Example",
    "address": "東京都渋谷区...",
    "cachedImageUrl": "https://...",
    "rating": 4.5
  },
  "userMemo": "友達のおすすめ",
  "sourceShareToken": "abc123xyz",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### エラー
| コード | 説明 |
|--------|------|
| COLLECTION_NOT_FOUND | コレクションが見つかりません |
| PLACE_NOT_FOUND | 指定された場所が見つかりません |
| ALREADY_EXISTS | この場所は既にコレクションに追加されています |

### 実装ファイル
- Controller: `src/worker/controller/CollectionsRoutes.ts`
- UseCase: `src/worker/usecase/AddCollectionItemUseCase.ts`

---

## 7. アイテム削除

コレクションから Place を削除

### エンドポイント
```
DELETE /api/collections/:collectionId/items/:placeId
```

### 認証
要認証（Better Auth）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| collectionId | string | コレクションID |
| placeId | string | Google Place ID |

### レスポンス (204 No Content)
レスポンスボディなし

### エラー
| コード | 説明 |
|--------|------|
| COLLECTION_NOT_FOUND | コレクションが見つかりません |
| FORBIDDEN | このコレクションを編集する権限がありません |
| ITEM_NOT_FOUND | 指定されたアイテムが見つかりません |

### 実装ファイル
- Controller: `src/worker/controller/CollectionsRoutes.ts`
- UseCase: `src/worker/usecase/RemoveCollectionItemUseCase.ts`

---

## 使用テーブル
- `collections` - コレクション
- `collection_items` - アイテム
- `places` - 場所マスタ
- `place_details_cache` - 詳細キャッシュ
- `categories` - カテゴリ情報

## Repository
- `src/worker/infrastructure/repository/CollectionRepository.ts`

## 備考
- デフォルトコレクション（isDefault: true）は削除・名前変更不可
- 同じ場所を同じコレクションに2回追加はエラー（unique constraint）
- 同じ場所を別のコレクションに追加は可能
- sourceShareToken で共有パックからの追跡が可能
