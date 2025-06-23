import { cashRegister } from "./cash-register";
import { storeExpense } from "./store-expense";
import { expense } from "./expense-schema";
import { profiles, userSessions } from "./user-profile";
import { expenseCategory } from "./expense-category";

export const schema = {
  cashRegister,
  storeExpense,
  expense,
  profiles,
  userSessions,
  expenseCategory
};
