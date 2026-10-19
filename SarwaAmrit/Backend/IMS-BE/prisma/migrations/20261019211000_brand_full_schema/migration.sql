-- BrandStatus enum and extended Brand columns (idempotent for dev DBs)

DO $$ BEGIN
  CREATE TYPE "BrandStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "code" VARCHAR(80);
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "bannerUrl" VARCHAR(2048);
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "status" "BrandStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMPTZ(3);
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "metaTitle" VARCHAR(200);
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "metaDescription" VARCHAR(500);
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ(3);

UPDATE "Brand"
SET "code" = UPPER(REPLACE("slug", '-', '_'))
WHERE "code" IS NULL;

UPDATE "Brand"
SET "code" = 'BRAND_' || SUBSTRING(REPLACE("id"::text, '-', ''), 1, 8)
WHERE "code" IS NULL OR "code" = '';

ALTER TABLE "Brand" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Brand_code_key" ON "Brand"("code");
CREATE INDEX IF NOT EXISTS "Brand_status_name_idx" ON "Brand"("status", "name");
CREATE INDEX IF NOT EXISTS "Brand_isVerified_status_idx" ON "Brand"("isVerified", "status");
CREATE INDEX IF NOT EXISTS "Brand_deletedAt_idx" ON "Brand"("deletedAt");
