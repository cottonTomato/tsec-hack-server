CREATE TYPE "public"."daily_gig_application_status" AS ENUM('present', 'absent', 'paid');--> statement-breakpoint
CREATE TYPE "public"."gig_application_status" AS ENUM('completed', 'applied', 'cancelled', 'progressing');--> statement-breakpoint
CREATE TYPE "public"."gig_types" AS ENUM('random', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('worker', 'employer', 'company');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_gig_application_track" (
	"id" serial PRIMARY KEY NOT NULL,
	"gig_application_id" serial NOT NULL,
	"date" date DEFAULT now(),
	"todays_status" "daily_gig_application_status" NOT NULL,
	"status_changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gig_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_id" serial NOT NULL,
	"gig_id" serial NOT NULL,
	"gig_status" "gig_application_status" NOT NULL,
	"applied_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gig" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" text,
	"employer_id" serial NOT NULL,
	"worker_type" serial NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"pay_per_day" integer NOT NULL,
	"images" json,
	"gig_type" "gig_types" NOT NULL,
	"start_date" date DEFAULT now(),
	"end_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"employer_id" integer,
	"worker_id" integer,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "age_check1" CHECK ("ratings"."rating" >= 1 AND "ratings"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone" varchar(10) NOT NULL,
	"company_detail" text,
	"role" "user_roles",
	"average_rating" double precision DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"photo" varchar,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "worker_expertise" (
	"woker_id" serial NOT NULL,
	"worker_type_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "worker_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_type_name" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "worker_types_worker_type_name_unique" UNIQUE("worker_type_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_gig_application_track" ADD CONSTRAINT "daily_gig_application_track_gig_application_id_gig_applications_id_fk" FOREIGN KEY ("gig_application_id") REFERENCES "public"."gig_applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gig_applications" ADD CONSTRAINT "gig_applications_worker_id_users_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gig_applications" ADD CONSTRAINT "gig_applications_gig_id_gig_id_fk" FOREIGN KEY ("gig_id") REFERENCES "public"."gig"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gig" ADD CONSTRAINT "gig_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gig" ADD CONSTRAINT "gig_worker_type_worker_types_id_fk" FOREIGN KEY ("worker_type") REFERENCES "public"."worker_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_worker_id_users_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "worker_expertise" ADD CONSTRAINT "worker_expertise_woker_id_users_id_fk" FOREIGN KEY ("woker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "worker_expertise" ADD CONSTRAINT "worker_expertise_worker_type_id_worker_types_id_fk" FOREIGN KEY ("worker_type_id") REFERENCES "public"."worker_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gig_application_idx" ON "daily_gig_application_track" USING btree ("gig_application_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "worker_idx" ON "gig_applications" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pay_idx" ON "gig" USING btree ("pay_per_day");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "employer_idx" ON "gig" USING btree ("employer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "location_idx" ON "gig" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "start_date_idx" ON "gig" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "end_date_idx" ON "gig" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rating_idx" ON "users" USING btree ("average_rating");