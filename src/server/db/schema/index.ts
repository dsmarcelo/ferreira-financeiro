import { cashRegister } from "./cash-register";
import { personalExpense } from "./personal-expense";
import { storeExpense } from "./store-expense";
import { expense } from "./expense-schema";
import { profiles, userSessions } from "./user-profile";

export const schema = {
  cashRegister,
  personalExpense,
  storeExpense,
  expense,
  profiles,
  userSessions,
};
