import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * ユーザーテーブル
 * Firebase Authで認証されたユーザー情報を保存
 * 認証情報（セッション、アカウント、トークンなど）はFirebase側で管理されるため、
 * このテーブルにはユーザーの基本情報のみを保存
 */
export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(), // Firebase Authのuid
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
