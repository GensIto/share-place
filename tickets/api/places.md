# Places API

場所（Place）に関する API 群

---

## 1. AI 検索

Gemini AI を使用した自然言語による場所検索

### エンドポイント
```
POST /api/places/search/ai
```

### 認証
要認証（Better Auth）

### リクエスト
```json
{
  "query": "渋谷でおしゃれなカフェ",
  "location": {
    "latitude": 35.6595,
    "longitude": 139.7004
  },
  "radius": 5000,
  "limit": 20
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| query | string | Yes | 自然言語の検索クエリ |
| location.latitude | number | Yes | 緯度 |
| location.longitude | number | Yes | 経度 |
| radius | number | No | 検索半径（メートル）デフォルト: 5000 |
| limit | number | No | 取得件数上限 デフォルト: 20 |

### レスポンス (200 OK)
```json
{
  "places": [
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
      "aiRecommendReason": "おしゃれな内装と静かな雰囲気が特徴です"
    }
  ],
  "totalCount": 15
}
```

### 処理フロー
1. リクエストバリデーション
2. Gemini API に query を送信し、検索キーワード・カテゴリを抽出
3. Google Places API で検索実行
4. 結果を places テーブルに登録（存在しない場合）
5. place_details_cache を更新
6. NOPE 済みの場所を除外
7. レスポンス返却

### 実装ファイル
- Controller: `src/worker/controller/PlacesRoutes.ts`
- UseCase: `src/worker/usecase/SearchPlacesWithAiUseCase.ts`

---

## 2. Google Map 検索

位置情報ベースの Google Places API を使った場所検索

### エンドポイント
```
POST /api/places/search/nearby
```

### 認証
要認証（Better Auth）

### リクエスト
```json
{
  "location": {
    "latitude": 35.6595,
    "longitude": 139.7004
  },
  "radius": 1000,
  "type": "restaurant",
  "keyword": "ラーメン",
  "limit": 20,
  "pageToken": null
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| location.latitude | number | Yes | 緯度 |
| location.longitude | number | Yes | 経度 |
| radius | number | No | 検索半径（メートル）デフォルト: 1000 |
| type | string | No | Google Places type (restaurant, cafe 等) |
| keyword | string | No | キーワード検索 |
| limit | number | No | 取得件数上限 デフォルト: 20 |
| pageToken | string | No | ページネーション用トークン |

### レスポンス (200 OK)
```json
{
  "places": [
    {
      "placeId": "ChIJ...",
      "name": "ラーメン一蘭",
      "address": "東京都渋谷区...",
      "latitude": 35.6595,
      "longitude": 139.7004,
      "cachedImageUrl": "https://...",
      "rating": 4.2,
      "reviewCount": 500,
      "priceLevel": 2,
      "categoryTag": "ラーメン"
    }
  ],
  "nextPageToken": "CpQC...",
  "totalCount": 20
}
```

### 処理フロー
1. リクエストバリデーション
2. Google Places Nearby Search API を呼び出し
3. 結果を places テーブルに登録（upsert）
4. place_details_cache を更新
5. NOPE 済みの場所を除外
6. レスポンス返却

### 実装ファイル
- Controller: `src/worker/controller/PlacesRoutes.ts`
- UseCase: `src/worker/usecase/SearchPlacesNearbyUseCase.ts`

---

## 3. Place 登録/更新

新規 Place の登録および既存 Place の詳細情報更新

### エンドポイント
```
POST /api/places
```

### 認証
要認証（Better Auth）

### リクエスト
```json
{
  "placeId": "ChIJ...",
  "latitude": 35.6595,
  "longitude": 139.7004,
  "details": {
    "name": "Cafe Example",
    "address": "東京都渋谷区...",
    "cachedImageUrl": "https://...",
    "rating": 4.5,
    "reviewCount": 120,
    "priceLevel": 2,
    "categoryTag": "カフェ",
    "rawJson": "{...}"
  }
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| placeId | string | Yes | Google Place ID |
| latitude | number | Yes | 緯度 |
| longitude | number | Yes | 経度 |
| details | object | No | 詳細情報（省略時は Google API から取得） |

### レスポンス (200 OK / 201 Created)
```json
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
  "isNew": true
}
```

### 処理フロー
1. リクエストバリデーション
2. placeId で既存レコード確認
3. places テーブルに upsert
4. details が提供されていれば place_details_cache に upsert
5. details が未提供の場合、Google Place Details API を呼び出して取得
6. レスポンス返却

### 実装ファイル
- Controller: `src/worker/controller/PlacesRoutes.ts`
- UseCase: `src/worker/usecase/UpsertPlaceUseCase.ts`

---

## 4. Place 詳細取得

特定の Place の詳細情報を取得

### エンドポイント
```
GET /api/places/:placeId
```

### 認証
認証任意（ログイン時は追加情報を返す）

### パスパラメータ
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| placeId | string | Google Place ID |

### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| refresh | boolean | No | true でキャッシュ無視して再取得 |

### レスポンス (200 OK)
```json
{
  "placeId": "ChIJ...",
  "name": "Cafe Example",
  "address": "東京都渋谷区道玄坂1-2-3",
  "latitude": 35.6595,
  "longitude": 139.7004,
  "cachedImageUrl": "https://...",
  "rating": 4.5,
  "reviewCount": 120,
  "priceLevel": 2,
  "categoryTag": "カフェ",
  "lastFetchedAt": "2024-01-15T10:30:00.000Z",
  "userContext": {
    "isInCollection": true,
    "collectionIds": ["col_xxx", "col_yyy"],
    "lastAction": {
      "actionType": "LIKE",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 処理フロー
1. placeId バリデーション
2. places + place_details_cache から取得
3. 存在しない or refresh=true の場合、Google API から取得
4. ログインユーザーの場合、userContext を取得
5. レスポンス返却

### 実装ファイル
- Controller: `src/worker/controller/PlacesRoutes.ts`
- UseCase: `src/worker/usecase/GetPlaceDetailUseCase.ts`

---

## 使用テーブル
- `places` - 場所マスタ
- `place_details_cache` - 詳細キャッシュ
- `user_actions` - NOPE済み除外用
- `collection_items` - コレクション登録状況

## 備考
- Gemini API / Google Places API の rate limit と利用料金に注意
- キャッシュの有効期限は lastFetchedAt で管理（例: 7日で再取得）
- 画像 URL は Cloudflare R2 にキャッシュすることを推奨
