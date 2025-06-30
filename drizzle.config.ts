import { type Config } from "drizzle-kit";
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

export default {
  schema: "./src/server/db/schema",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: ["ferreira-financeiro_*"],
} satisfies Config;