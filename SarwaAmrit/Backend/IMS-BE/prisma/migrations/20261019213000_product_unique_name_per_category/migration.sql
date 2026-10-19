-- Case-insensitive unique product name within each category (non-deleted rows)
CREATE UNIQUE INDEX IF NOT EXISTS "Product_categoryId_name_active_unique"
ON "Product" ("categoryId", LOWER("name"))
WHERE "deletedAt" IS NULL;
