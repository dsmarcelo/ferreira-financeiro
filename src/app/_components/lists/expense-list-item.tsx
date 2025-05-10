"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";
import type { PersonalExpense } from "@/server/db/schema/personal-expense";
import type { StoreExpense } from "@/server/db/schema/store-expense";
import type { ProductPurchase } from "@/server/db/schema/product-purchase";
import type { ProductPurchaseInstallment } from "@/server/db/schema/product-purchase";
import * as React from "react";

export interface ExpenseListItemProps {
  expense?: PersonalExpense | StoreExpense | ProductPurchase;
  installment?: ProductPurchaseInstallment;
  onTogglePaid: (id: number, checked: boolean) => void;
  children?: React.ReactNode;
}

export function ExpenseListItem({
  expense,
  installment,
  onTogglePaid,
  children,
}: ExpenseListItemProps) {
  return (
    <div
      className={cn(
        "hover:bg-background-secondary active:bg-accent flex cursor-pointer items-center gap-2 py-2 sm:px-2",
        expense?.isPaid && "",
      )}
    >
      <div className="flex w-full items-center gap-2">
        <Checkbox
          className="h-6 w-6 active:bg-slate-500"
          checked={expense?.isPaid ?? installment?.isPaid}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(checked) => {
            onTogglePaid(
              expense?.id ?? installment?.id ?? 0,
              checked as boolean,
            );
          }}
        />
        <p className="flex-1 break-words">
          {expense?.description ?? installment?.description}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <p
          className={cn(
            "w-fit text-right whitespace-nowrap",
            (expense?.isPaid ?? installment?.isPaid) && "line-through-gray",
          )}
        >
          {formatCurrency(expense?.value ?? installment?.amount ?? 0)}
        </p>
      </div>
      {children}
    </div>
  );
}
