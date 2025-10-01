import type { CashRegisterInsert } from "@/server/db/schema/cash-register-schema";

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof CashRegisterInsert]?: string[];
  };
}
