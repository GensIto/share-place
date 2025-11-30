import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./auth";
import { places } from "./places";

// ==========================================
// 行動ログ (User Actions)
// ==========================================

export const userActions = sqliteTable(
  "user_actions",
  {
    userActionId: integer("user_action_id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    placeId: text("place_id")
      .notNull()
      .references(() => places.placeId, { onDelete: "cascade" }),
    actionType: text("action_type").notNull(), // 'LIKE', 'NOPE', 'VIEW'
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("user_actions_userId_idx").on(table.userId),
    index("user_actions_placeId_idx").on(table.placeId),
    index("user_actions_userId_placeId_idx").on(table.userId, table.placeId),
  ]
);

// ==========================================
// Relations
// ==========================================

export const userActionRelations = relations(userActions, ({ one }) => ({
  user: one(users, {
    fields: [userActions.userId],
    references: [users.userId],
  }),
  place: one(places, {
    fields: [userActions.placeId],
    references: [places.placeId],
  }),
}));
