import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ==========================================
// 場所マスタ (Places Master)
// ==========================================

export const places = sqliteTable("places", {
  placeId: text("place_id").primaryKey(), // Google Place ID
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// ==========================================
// 場所詳細キャッシュ (Place Details Cache)
// ==========================================

export const placeDetailsCache = sqliteTable("place_details_cache", {
  placeId: text("place_id")
    .primaryKey()
    .references(() => places.placeId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  cachedImageUrl: text("cached_image_url"),
  rating: real("rating"),
  reviewCount: integer("review_count"),
  priceLevel: integer("price_level"),
  categoryTag: text("category_tag"),
  rawJson: text("raw_json"),
  lastFetchedAt: integer("last_fetched_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// ==========================================
// Relations
// ==========================================

export const placeRelations = relations(places, ({ one }) => ({
  detailsCache: one(placeDetailsCache, {
    fields: [places.placeId],
    references: [placeDetailsCache.placeId],
  }),
}));

export const placeDetailsCacheRelations = relations(
  placeDetailsCache,
  ({ one }) => ({
    place: one(places, {
      fields: [placeDetailsCache.placeId],
      references: [places.placeId],
    }),
  })
);
