import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import { places } from "./places";

// ==========================================
// シェア機能 (Social Sharing)
// ==========================================

export const sharedPacks = sqliteTable(
  "shared_packs",
  {
    shareToken: text("share_token").primaryKey(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("shared_packs_creatorId_idx").on(table.creatorId)]
);

export const sharedPackItems = sqliteTable(
  "shared_pack_items",
  {
    sharedPackItemId: integer("shared_pack_item_id").primaryKey({
      autoIncrement: true,
    }),
    sharedPackToken: text("shared_pack_token")
      .notNull()
      .references(() => sharedPacks.shareToken, { onDelete: "cascade" }),
    placeId: text("place_id")
      .notNull()
      .references(() => places.placeId, { onDelete: "cascade" }),
    publicComment: text("public_comment"),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("shared_pack_items_token_idx").on(table.sharedPackToken),
    index("shared_pack_items_placeId_idx").on(table.placeId),
  ]
);

// ==========================================
// Relations
// ==========================================

export const sharedPackRelations = relations(sharedPacks, ({ one, many }) => ({
  creator: one(users, {
    fields: [sharedPacks.creatorId],
    references: [users.userId],
  }),
  items: many(sharedPackItems),
}));

export const sharedPackItemRelations = relations(
  sharedPackItems,
  ({ one }) => ({
    sharedPack: one(sharedPacks, {
      fields: [sharedPackItems.sharedPackToken],
      references: [sharedPacks.shareToken],
    }),
    place: one(places, {
      fields: [sharedPackItems.placeId],
      references: [places.placeId],
    }),
  })
);
