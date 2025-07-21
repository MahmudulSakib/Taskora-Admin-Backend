-- 1. Allow NULL for "created_at" (if needed)
ALTER TABLE "vendor_ship_requests" ALTER COLUMN "created_at" DROP NOT NULL;

-- 2. ✅ Skip adding "user_id" because it already exists in the table

-- 3. Add "status" column only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'vendor_ship_requests'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE "vendor_ship_requests" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;
  END IF;
END $$;

-- 4. Add foreign key constraint (check first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'vendor_ship_requests_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "vendor_ship_requests"
    ADD CONSTRAINT "vendor_ship_requests_user_id_users_id_fk"
    FOREIGN KEY ("user_id")
    REFERENCES "public"."users"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;
