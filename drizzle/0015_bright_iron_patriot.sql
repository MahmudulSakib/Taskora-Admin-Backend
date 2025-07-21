-- Optional: Drop NOT NULL constraints if needed
ALTER TABLE "bonus_withdraw_requests" ALTER COLUMN "status" DROP NOT NULL;
ALTER TABLE "bonus_withdraw_requests" ALTER COLUMN "created_at" DROP NOT NULL;

-- Step 1: Add "method" column with DEFAULT value temporarily
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "method" text DEFAULT 'mobile';

-- Step 2: Ensure all rows have value
UPDATE "bonus_withdraw_requests" SET "method" = 'mobile' WHERE "method" IS NULL;

-- Step 3: Make it NOT NULL
ALTER TABLE "bonus_withdraw_requests" ALTER COLUMN "method" SET NOT NULL;

-- Step 4: Add remaining optional columns
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "mobile_number" text;
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "account_number" text;
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "branch_name" text;
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "account_name" text;
