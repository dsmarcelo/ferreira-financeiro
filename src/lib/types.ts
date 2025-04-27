import type { CashRegisterInsert } from "@/server/db/schema/cash-register";

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof CashRegisterInsert]?: string[];
  };
}
