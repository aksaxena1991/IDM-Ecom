-- Unique name only among active categories (deleted_at IS NULL)
DROP INDEX IF EXISTS "categories_name_unique";
DROP INDEX IF EXISTS "categories_name_active_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_active_unique"
ON "categories" (LOWER("name"))
WHERE "deleted_at" IS NULL;
