import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import { schema } from "./schema";
import * as relations from "./schema/relations";

const client = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
});
