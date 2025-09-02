import { cashRegister } from "./cash-register-schema";
import { expense } from "./expense-schema";
import { profiles, userSessions } from "./user-profile";
import { expenseCategory } from "./expense-category";
import { incomes } from "./incomes-schema";
import { sales } from "./sales-schema";
import { users, accounts, sessions, verificationTokens } from "./auth-schema";
import { products } from "./products-schema";
import { cashRegisterItem } from "./cash-register-items";
import { customers } from "./customers";
import { incomeItem } from "./income-items";

export const schema = {
  cashRegister,
  expense,
  profiles,
  userSessions,
  expenseCategory,
  incomes,
  sales,
  products,
  cashRegisterItem,
  customers,
  incomeItem,
  // Auth.js tables
  users,
  accounts,
  sessions,
  verificationTokens,
};

// Re-export auth tables for easy import
export { users, accounts, sessions, verificationTokens } from "./auth-schema";
