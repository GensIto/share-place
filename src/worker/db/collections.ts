import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import { places } from "./places";
import { sharedPacks } from "./sharedPacks";

// ==========================================
// コレクション機能 (My Collection)
// ==========================================

export const collections = sqliteTable(
  "collections",
  {
    collectionId: text("collection_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    iconEmoji: text("icon_emoji"),
    displayOrder: integer("display_order").default(0).notNull(),
    isDefault: integer("is_default", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("collections_userId_idx").on(table.userId)]
);

export const collectionItems = sqliteTable(
  "collection_items",
  {
    collectionItemId: integer("collection_item_id").primaryKey({
      autoIncrement: true,
    }),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.collectionId, { onDelete: "cascade" }),
    placeId: text("place_id")
      .notNull()
      .references(() => places.placeId, { onDelete: "cascade" }),
    userMemo: text("user_memo"),
    sourceShareToken: text("source_share_token").references(
      () => sharedPacks.shareToken,
      { onDelete: "set null" }
    ),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("collection_items_collectionId_idx").on(table.collectionId),
    index("collection_items_placeId_idx").on(table.placeId),
    uniqueIndex("collection_items_unique_idx").on(
      table.collectionId,
      table.placeId
    ),
  ]
);

// ==========================================
// Relations
// ==========================================

export const collectionRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.userId],
  }),
  items: many(collectionItems),
}));

export const collectionItemRelations = relations(
  collectionItems,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionItems.collectionId],
      references: [collections.collectionId],
    }),
    place: one(places, {
      fields: [collectionItems.placeId],
      references: [places.placeId],
    }),
    sourceSharedPack: one(sharedPacks, {
      fields: [collectionItems.sourceShareToken],
      references: [sharedPacks.shareToken],
    }),
  })
);
