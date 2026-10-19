-- Unique category name for all rows (including soft-deleted)
DROP INDEX IF EXISTS "categories_name_active_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_unique"
ON "categories" (LOWER("name"));
