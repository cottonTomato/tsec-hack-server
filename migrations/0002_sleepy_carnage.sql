ALTER TABLE "gig" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gig" DROP COLUMN IF EXISTS "gig_type";--> statement-breakpoint
ALTER TABLE "gig" DROP COLUMN IF EXISTS "start_time";--> statement-breakpoint
ALTER TABLE "gig" DROP COLUMN IF EXISTS "end_time";--> statement-breakpoint
DROP TYPE "public"."gig_types";