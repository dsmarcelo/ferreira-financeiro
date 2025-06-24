ALTER TABLE "ferreira-financeiro_incomes" ADD COLUMN "description" text;--> statement-breakpoint
UPDATE "ferreira-financeiro_incomes" SET "description" = '' WHERE "description" IS NULL;--> statement-breakpoint
ALTER TABLE "ferreira-financeiro_incomes" ADD COLUMN "date_time" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ferreira-financeiro_incomes" DROP COLUMN "date";