import { sql } from "drizzle-orm";
import { createTable } from "./table-creator";
import { serial, text, timestamp } from "drizzle-orm/pg-core";

export const customers = createTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type Customer = typeof customers.$inferSelect;
export type CustomerInsert = typeof customers.$inferInsert;


