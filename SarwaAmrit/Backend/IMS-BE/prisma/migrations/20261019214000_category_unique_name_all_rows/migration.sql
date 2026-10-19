-- Category names stay unique even after soft delete (deleted_at IS NOT NULL)
DROP INDEX IF EXISTS "categories_name_active_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_unique"
ON "categories" (LOWER("name"));
