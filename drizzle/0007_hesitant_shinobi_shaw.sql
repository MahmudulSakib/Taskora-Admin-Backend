ALTER TABLE "job_post_requests" ALTER COLUMN "left_limit" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "job_post_requests" ALTER COLUMN "left_limit" SET NOT NULL;