PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_place_details_cache` (
	`place_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`photo_reference` text,
	`rating` real,
	`review_count` integer,
	`price_level` integer,
	`category_tag` text,
	`last_fetched_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`place_id`) REFERENCES `places`(`place_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_place_details_cache`("place_id", "name", "address", "rating", "review_count", "price_level", "category_tag", "last_fetched_at") SELECT "place_id", "name", "address", "rating", "review_count", "price_level", "category_tag", "last_fetched_at" FROM `place_details_cache`;
--> statement-breakpoint
DROP TABLE `place_details_cache`;
--> statement-breakpoint
ALTER TABLE `__new_place_details_cache` RENAME TO `place_details_cache`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;

