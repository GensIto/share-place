CREATE TABLE `categories` (
	`category_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`emoji` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `categories_userId_idx` ON `categories` (`user_id`);--> statement-breakpoint
ALTER TABLE `collections` ADD `category_id` text REFERENCES categories(category_id);--> statement-breakpoint
CREATE INDEX `collections_categoryId_idx` ON `collections` (`category_id`);--> statement-breakpoint
ALTER TABLE `collections` DROP COLUMN `icon_emoji`;