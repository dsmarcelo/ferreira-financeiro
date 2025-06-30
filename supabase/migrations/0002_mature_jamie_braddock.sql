CREATE TABLE "ferreira-financeiro_auth_accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "ferreira-financeiro_auth_accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "ferreira-financeiro_auth_sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ferreira-financeiro_auth_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "ferreira-financeiro_auth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ferreira-financeiro_auth_verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "ferreira-financeiro_auth_verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "ferreira-financeiro_auth_accounts" ADD CONSTRAINT "ferreira-financeiro_auth_accounts_user_id_ferreira-financeiro_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ferreira-financeiro_auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ferreira-financeiro_auth_sessions" ADD CONSTRAINT "ferreira-financeiro_auth_sessions_user_id_ferreira-financeiro_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ferreira-financeiro_auth_users"("id") ON DELETE cascade ON UPDATE no action;