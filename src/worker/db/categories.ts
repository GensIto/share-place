import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

// ==========================================
// カテゴリー機能 (ログインユーザー専用)
// ==========================================

export const categories = sqliteTable(
  "categories",
  {
    categoryId: text("category_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    emoji: text("emoji"),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("categories_userId_idx").on(table.userId)]
);

// ==========================================
// Relations
// ==========================================

export const categoryRelations = relations(categories, ({ one }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.userId],
  }),
}));
