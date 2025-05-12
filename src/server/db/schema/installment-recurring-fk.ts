import { installment } from "./installment";
import { recurringExpense } from "./recurring-expense";
import { serial } from "drizzle-orm/pg-core";

// Add recurringExpenseId FK to installment (nullable)
installment.recurringExpenseId = serial("recurring_expense_id")
  .references(() => recurringExpense.id);
