# Shared Packs API

共有パック（カードパック）に関する API 群

---

## 1. SharedPack 取得

共有された Pack の取得（公開リンクから場所一覧を表示）

### エンドポイント
```
GET /api/shared-packs/:shareToken
```

### 認証
認証不要（公開リンク）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| shareToken | string | 共有トークン |

### レスポンス (200 OK)
```json
{
  "shareToken": "abc123xyz",
  "title": "渋谷のおすすめカフェ",
  "message": "友達と行ったカフェをまとめました！",
  "creator": {
    "userId": "user_xxx",
    "name": "田中太郎",
    "image": "https://..."
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "items": [
    {
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
      "publicComment": "ここのラテアートが最高！",
      "sortOrder": 0
    }
  ],
  "itemCount": 5
}
```

### エラー
| コード | 説明 |
|--------|------|
| PACK_NOT_FOUND | 共有パックが見つかりません |

### 処理フロー
1. shareToken でバリデーション
2. shared_packs テーブルから取得
3. shared_pack_items を sortOrder 順で取得
4. 各 item の place 詳細を place_details_cache から取得
5. creator 情報を users テーブルから取得

### 実装ファイル
- Controller: `src/worker/controller/SharedPacksRoutes.ts`
- UseCase: `src/worker/usecase/GetSharedPackUseCase.ts`

---

## 2. SharedPack 作成

コレクションから共有パックを作成し、共有用リンクを生成

### エンドポイント
```
POST /api/shared-packs
```

### 認証
要認証（Better Auth）

### リクエスト
```json
{
  "title": "渋谷のおすすめカフェ",
  "message": "友達と行ったカフェをまとめました！",
  "items": [
    {
      "placeId": "ChIJ...",
      "publicComment": "ここのラテアートが最高！",
      "sortOrder": 0
    },
    {
      "placeId": "ChIJ...",
      "publicComment": "静かで作業に最適",
      "sortOrder": 1
    }
  ]
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| title | string | Yes | パックタイトル（1-100文字） |
| message | string | No | メッセージ（500文字以内） |
| items | array | Yes | 共有するアイテム（1件以上） |
| items[].placeId | string | Yes | Google Place ID |
| items[].publicComment | string | No | 公開コメント（300文字以内） |
| items[].sortOrder | number | No | 表示順（デフォルト: 配列順） |

### レスポンス (201 Created)
```json
{
  "shareToken": "abc123xyz",
  "shareUrl": "https://share-place.example.com/p/abc123xyz",
  "title": "渋谷のおすすめカフェ",
  "message": "友達と行ったカフェをまとめました！",
  "itemCount": 2,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### エラー
| コード | 説明 |
|--------|------|
| INVALID_TITLE | タイトルは1〜100文字で入力してください |
| EMPTY_ITEMS | 1件以上のアイテムを選択してください |
| PLACE_NOT_FOUND | 指定された場所が見つかりません: ChIJ... |

### 処理フロー
1. リクエストバリデーション
2. 各 placeId の存在確認
3. shareToken を生成（nanoid 等でユニークな短い文字列）
4. shared_packs テーブルに INSERT
5. shared_pack_items テーブルに各アイテムを INSERT
6. 共有 URL を生成

### 実装ファイル
- Controller: `src/worker/controller/SharedPacksRoutes.ts`
- UseCase: `src/worker/usecase/CreateSharedPackUseCase.ts`

---

## 3. 自分の SharedPack 一覧

ログインユーザーが作成した共有パックの一覧を取得

### エンドポイント
```
GET /api/shared-packs
```

### 認証
要認証（Better Auth）

### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| limit | number | No | 取得件数（デフォルト: 20） |
| offset | number | No | オフセット（デフォルト: 0） |

### レスポンス (200 OK)
```json
{
  "sharedPacks": [
    {
      "shareToken": "abc123xyz",
      "shareUrl": "https://share-place.example.com/p/abc123xyz",
      "title": "渋谷のおすすめカフェ",
      "message": "友達と行ったカフェをまとめました！",
      "itemCount": 5,
      "thumbnails": [
        "https://...",
        "https://...",
        "https://..."
      ],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalCount": 10,
  "hasMore": false
}
```

### 処理フロー
1. 認証情報からユーザーID取得
2. shared_packs テーブルから createdAt 降順で取得
3. 各パックのアイテム数をカウント
4. サムネイル用に最初の3件の画像URLを取得
5. 共有 URL を生成

### 実装ファイル
- Controller: `src/worker/controller/SharedPacksRoutes.ts`
- UseCase: `src/worker/usecase/GetMySharedPacksUseCase.ts`

---

## 使用テーブル
- `shared_packs` - 共有パック
- `shared_pack_items` - パック内アイテム
- `places` - 場所マスタ
- `place_details_cache` - 詳細キャッシュ
- `users` - 作成者情報

## Repository
- `src/worker/infrastructure/repository/SharedPackRepository.ts`

## 備考
- shareToken は URL safe な短い文字列（例: nanoid 10文字）
- 同じ内容で複数回共有可能（毎回新しい shareToken が発行される）
- 共有パックは作成後に編集不可（削除のみ可能にする場合は別 API）
- items の上限を設ける場合は要検討（例: 50件まで）
- 公開 API のため GET /api/shared-packs/:shareToken は認証不要
