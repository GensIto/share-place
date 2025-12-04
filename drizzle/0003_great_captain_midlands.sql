ALTER TABLE `place_details_cache` ADD `photo_reference` text;--> statement-breakpoint
ALTER TABLE `place_details_cache` DROP COLUMN `cached_image_url`;--> statement-breakpoint
ALTER TABLE `place_details_cache` DROP COLUMN `raw_json`;