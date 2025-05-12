import { storeExpense } from "./store-expense";
import { recurringExpense } from "./recurring-expense";
import { serial } from "drizzle-orm/pg-core";

// Add recurringExpenseId FK to storeExpense (nullable)
storeExpense.recurringExpenseId = serial("recurring_expense_id")
  .references(() => recurringExpense.id);
