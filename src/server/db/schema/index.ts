import { cashRegister } from "./cash-register";
import { personalExpense } from "./personal-expense";
import { storeExpense } from "./store-expense";
import { productPurchase } from "./product-purchase";
import { expense } from "./expense-schema";
import { recurrenceRule } from "./expense-schema";
import { recurringExpenseOccurrence } from "./recurring-expense-occurrence";

export const schema = {
  cashRegister,
  personalExpense,
  storeExpense,
  productPurchase,
  expense,
  recurrenceRule,
  recurringExpenseOccurrence,
};
