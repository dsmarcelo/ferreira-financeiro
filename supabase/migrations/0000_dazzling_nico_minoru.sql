DO $$ BEGIN
    CREATE TYPE "public"."expense_source" AS ENUM('personal', 'store', 'product_purchase');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."expense_type" AS ENUM('one_time', 'installment', 'recurring', 'recurring_occurrence');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."recurrence_type" AS ENUM('weekly', 'monthly', 'yearly', 'custom_days');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ferreira-financeiro_cash_register" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"date" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ferreira-financeiro_expense_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT 'blue' NOT NULL,
	"emoji" text DEFAULT '💸' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ferreira-financeiro_expense" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"date" date NOT NULL,
	"type" "expense_type" NOT NULL,
	"source" "expense_source" NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"category_id" integer,
	"installment_number" integer,
	"total_installments" integer,
	"group_id" uuid,
	"recurrence_type" "recurrence_type",
	"recurrence_interval" integer,
	"recurrence_end_date" date,
	"original_recurring_expense_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ferreira-financeiro_incomes" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"profit_margin" numeric(15, 2) NOT NULL,
	"date" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ferreira-financeiro_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"display_name" text,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ferreira-financeiro_user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_info" text,
	"ip_address" text,
	"user_agent" text,
	"last_activity" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ferreira-financeiro_expense_category_id_ferreira-financeiro_expense_category_id_fk') THEN
		ALTER TABLE "ferreira-financeiro_expense" ADD CONSTRAINT "ferreira-financeiro_expense_category_id_ferreira-financeiro_expense_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ferreira-financeiro_expense_category"("id") ON DELETE no action ON UPDATE no action;
	END IF;
END $$;