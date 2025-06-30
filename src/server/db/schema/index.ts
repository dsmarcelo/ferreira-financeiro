import { cashRegister } from "./cash-register";
import { expense } from "./expense-schema";
import { profiles, userSessions } from "./user-profile";
import { expenseCategory } from "./expense-category";
import { incomes } from "./incomes-schema";
import { users, accounts, sessions, verificationTokens } from "./auth-schema";

export const schema = {
  cashRegister,
  expense,
  profiles,
  userSessions,
  expenseCategory,
  incomes,
  // Auth.js tables
  users,
  accounts,
  sessions,
  verificationTokens,
};

// Re-export auth tables for easy import
export { users, accounts, sessions, verificationTokens } from "./auth-schema";
