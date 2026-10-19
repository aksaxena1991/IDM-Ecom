-- Case-insensitive unique name among non-deleted categories
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_active_unique"
ON "categories" (LOWER("name"))
WHERE "deleted_at" IS NULL;
