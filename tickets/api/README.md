# API 実装ガイド

## 実装フェーズ

依存関係を考慮した実装順序。各フェーズ内の API は並行して実装可能。

---

## Phase 1: 基盤 API（依存なし）

他の API の前提となる基盤部分。

| API | ファイル | 説明 |
|-----|----------|------|
| Place 登録/更新 | [places.md](places.md) | 全ての場所データの基盤 |
| Place 詳細取得 | [places.md](places.md) | 場所情報の参照 |
| カテゴリ一覧取得 | [categories.md](categories.md) | カテゴリ管理の基盤 |
| カテゴリ追加 | [categories.md](categories.md) | |
| カテゴリ削除 | [categories.md](categories.md) | |

**必要な実装:**
- Value Objects: `PlaceId`, `CategoryId`
- Entities: `Place`, `Category`
- Repositories: `PlaceRepository`, `CategoryRepository`

---

## Phase 2: コレクション API

Phase 1 の Place, Category に依存。

| API | ファイル | 依存 |
|-----|----------|------|
| コレクション作成 | [collections.md](collections.md) | Category |
| コレクション一覧取得 | [collections.md](collections.md) | Category |
| コレクション詳細取得 | [collections.md](collections.md) | Place |
| コレクション更新 | [collections.md](collections.md) | Category |
| コレクション削除 | [collections.md](collections.md) | - |
| アイテム追加 | [collections.md](collections.md) | Place |
| アイテム削除 | [collections.md](collections.md) | - |

**必要な実装:**
- Value Objects: `CollectionId`, `CollectionItemId`
- Entities: `Collection`, `CollectionItem`
- Repositories: `CollectionRepository`

---

## Phase 3: ユーザーアクション API

Phase 1 の Place に依存。

| API | ファイル | 依存 |
|-----|----------|------|
| LIKE/NOPE アクション保存 | [user-actions.md](user-actions.md) | Place |
| アクション履歴取得 | [user-actions.md](user-actions.md) | Place |

**必要な実装:**
- Value Objects: `UserActionId`, `ActionType`
- Entities: `UserAction`
- Repositories: `UserActionRepository`

---

## Phase 4: 検索 API

Phase 1 の Place + Phase 3 の UserAction に依存（NOPE 除外のため）。

| API | ファイル | 依存 |
|-----|----------|------|
| Google Map 検索 | [places.md](places.md) | Place, UserAction |
| AI 検索 | [places.md](places.md) | Place, UserAction, Gemini |

**必要な実装:**
- External Services: `GooglePlacesService`, `GeminiService`
- UseCases: `SearchPlacesNearbyUseCase`, `SearchPlacesWithAiUseCase`

---

## Phase 5: 共有 API

Phase 1 の Place + Phase 2 の Collection に依存。

| API | ファイル | 依存 |
|-----|----------|------|
| SharedPack 作成 | [shared-packs.md](shared-packs.md) | Place |
| SharedPack 取得 | [shared-packs.md](shared-packs.md) | Place |
| 自分の SharedPack 一覧 | [shared-packs.md](shared-packs.md) | - |

**必要な実装:**
- Value Objects: `ShareToken`
- Entities: `SharedPack`, `SharedPackItem`
- Repositories: `SharedPackRepository`

---

## 依存関係図

```
Phase 1 (基盤)
├── Place API ─────────────────┬──────────────────┐
│                              │                  │
└── Category API               │                  │
        │                      │                  │
        ▼                      ▼                  ▼
Phase 2                   Phase 3            Phase 5
Collection API ◄───────── UserAction API     SharedPack API
        │                      │
        │                      │
        └──────────┬───────────┘
                   ▼
              Phase 4
              Search API (AI / Google Map)
```

---

## 推奨実装順序（詳細）

### Step 1: インフラ準備
```
□ PlaceRepository 実装
□ CategoryRepository 実装
□ 関連 Value Objects / Entities 実装
```

### Step 2: Phase 1 API 実装
```
□ POST /api/places
□ GET /api/places/:placeId
□ GET /api/categories
□ POST /api/categories
□ DELETE /api/categories/:categoryId
```

### Step 3: Phase 2 API 実装
```
□ CollectionRepository 実装
□ POST /api/collections
□ GET /api/collections
□ GET /api/collections/:collectionId
□ PATCH /api/collections/:collectionId
□ DELETE /api/collections/:collectionId
□ POST /api/collections/:collectionId/items
□ DELETE /api/collections/:collectionId/items/:placeId
```

### Step 4: Phase 3 API 実装
```
□ UserActionRepository 実装
□ POST /api/user-actions
□ GET /api/user-actions
```

### Step 5: Phase 4 API 実装
```
□ GooglePlacesService 実装
□ GeminiService 実装
□ POST /api/places/search/nearby
□ POST /api/places/search/ai
```

### Step 6: Phase 5 API 実装
```
□ SharedPackRepository 実装
□ POST /api/shared-packs
□ GET /api/shared-packs/:shareToken
□ GET /api/shared-packs
```

---

## API 一覧サマリ

| Phase | API 数 | ファイル |
|-------|--------|----------|
| 1 | 5 | places.md, categories.md |
| 2 | 7 | collections.md |
| 3 | 2 | user-actions.md |
| 4 | 2 | places.md |
| 5 | 3 | shared-packs.md |
| **計** | **19** | |

---

## 備考

- Phase 1-3 は外部 API 依存がなく、単体テストしやすい
- Phase 4 は Google/Gemini API のモック実装から始めると良い
- Phase 5 は Phase 2 完了後いつでも着手可能
- 各 Phase 内の API は並行実装可能
