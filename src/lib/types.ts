import type { CashRegisterInsert } from "@/server/db/schema/cash-register";

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof CashRegisterInsert]?: string[];
  };
}

/**
 * Represents a generic calendar entry with optional properties
 */
export interface CalendarEntry {
  id: string;
  value: number; // monetary value
  date: string; // YYYY-MM-DD
  description?: string;
  dueDate?: string;
  isPaid?: boolean;
}
