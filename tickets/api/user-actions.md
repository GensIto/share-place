# User Actions API

ユーザーアクション（LIKE/NOPE）に関する API 群

---

## 1. アクション保存 (LIKE / NOPE)

ユーザーがスワイプした際のアクション記録

### エンドポイント
```
POST /api/user-actions
```

### 認証
要認証（Better Auth）

### リクエスト
```json
{
  "placeId": "ChIJ...",
  "actionType": "LIKE"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| placeId | string | Yes | Google Place ID |
| actionType | string | Yes | `LIKE` or `NOPE` |

### レスポンス (201 Created)
```json
{
  "userActionId": 123,
  "userId": "user_xxx",
  "placeId": "ChIJ...",
  "actionType": "LIKE",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### エラー
| コード | 説明 |
|--------|------|
| PLACE_NOT_FOUND | 指定された場所が見つかりません |
| INVALID_ACTION_TYPE | actionType は LIKE または NOPE を指定してください |

### 処理フロー
1. リクエストバリデーション
2. placeId の存在確認（places テーブル）
3. user_actions テーブルに INSERT
4. レスポンス返却

### 実装ファイル
- Controller: `src/worker/controller/UserActionsRoutes.ts`
- UseCase: `src/worker/usecase/SaveUserActionUseCase.ts`

### 備考
- LIKE と NOPE は同じエンドポイントで actionType で区別
- 同じ場所に対する重複アクションは許可（履歴として記録）
- LIKE 後のコレクション追加は別 API で行う
- NOPE した場所は検索結果から除外される

---

## 2. アクション履歴取得

ユーザーの LIKE/NOPE アクション履歴を取得

### エンドポイント
```
GET /api/user-actions
```

### 認証
要認証（Better Auth）

### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| actionType | string | No | フィルタ: `LIKE`, `NOPE` |
| placeIds | string | No | カンマ区切りの Place ID |
| limit | number | No | 取得件数（デフォルト: 100） |
| offset | number | No | オフセット（デフォルト: 0） |

### レスポンス (200 OK)
```json
{
  "actions": [
    {
      "userActionId": 123,
      "placeId": "ChIJ...",
      "place": {
        "name": "Cafe Example",
        "cachedImageUrl": "https://..."
      },
      "actionType": "LIKE",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "userActionId": 124,
      "placeId": "ChIJ...",
      "place": {
        "name": "Restaurant ABC",
        "cachedImageUrl": "https://..."
      },
      "actionType": "NOPE",
      "createdAt": "2024-01-15T10:31:00.000Z"
    }
  ],
  "totalCount": 150,
  "hasMore": true
}
```

### NOPE 済み placeId のみ取得
```
GET /api/user-actions?actionType=NOPE
```

### 処理フロー
1. 認証情報からユーザーID取得
2. クエリパラメータでフィルタ条件を構築
3. user_actions テーブルから createdAt 降順で取得
4. place 詳細を結合（オプション）
5. レスポンス返却

### 実装ファイル
- Controller: `src/worker/controller/UserActionsRoutes.ts`
- UseCase: `src/worker/usecase/GetUserActionsUseCase.ts`

### 備考
- 検索 API から内部的に NOPE 済み placeId を取得するために使用
- フロントエンドでは「履歴」画面での利用を想定
- placeIds パラメータで特定の場所のアクション状態を確認可能

---

## 使用テーブル
- `user_actions` - アクション履歴
- `places` - 場所存在確認用
- `place_details_cache` - 詳細情報

## Repository
- `src/worker/infrastructure/repository/UserActionRepository.ts`
