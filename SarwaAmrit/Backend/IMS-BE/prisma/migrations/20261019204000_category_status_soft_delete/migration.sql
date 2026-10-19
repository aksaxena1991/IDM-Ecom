-- Idempotent upgrade for databases created before CategoryRecord used status + deleted_at.
DO $$ BEGIN
  CREATE TYPE "CategoryStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "categories" DROP COLUMN IF EXISTS "is_active";

DO $$ BEGIN
  ALTER TABLE "categories" ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'DRAFT';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "categories" ADD COLUMN "deleted_at" TIMESTAMP(3);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
