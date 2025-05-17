"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";
import type { Expense } from "@/server/db/schema/expense-schema";
import * as React from "react";
import EditExpenseSheet from "../sheets/edit-expense-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";

export interface ExpenseListItemProps {
  expense: Expense;
  onTogglePaid: (id: number, checked: boolean, date: string) => void;
  children?: React.ReactNode;
}

export function ExpenseListItem({
  expense,
  onTogglePaid,
  children,
}: ExpenseListItemProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const editLinkMap: Record<string, string> = {
    personal: `/despesas-pessoais/${expense.id}/editar`,
    store: `/despesas-loja/${expense.id}/editar`,
    product_purchase: `/compras-produtos/${expense.id}/editar`,
  };
  const editLink =
    editLinkMap[expense.source] ?? `/compras-produtos/${expense.id}/editar`;

  // Only the checkbox toggles paid, the rest opens the sheet
  // Use EditExpenseSheet with custom trigger
  // SheetTrigger wraps the content except the checkbox
  // Children are preserved
  const itemContent = (
    <div
      className={cn(
        "hover:bg-background-secondary active:bg-accent flex w-full items-center gap-2 p-2 rounded-lg",
        expense.isPaid && "border-green-500 border",
        !expense.isPaid && expense.date < new Date().toISOString() && "border-red-400 border",
      )}
    >
      <div className="flex w-full items-center gap-2">
        <Checkbox
          className="h-6 w-6 active:bg-slate-500"
          checked={expense.isPaid}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePaid(expense.id, !expense.isPaid, expense.date);
          }}
          onCheckedChange={(checked) => {
            onTogglePaid(expense.id, checked as boolean, expense.date);
          }}
        />
        <p className="flex-1 break-words">{expense.description}</p>
      </div>
      <div className="flex items-center gap-1">
        <p
          className={cn(
            "w-fit text-right whitespace-nowrap",
          )}
        >
          {formatCurrency(Number(expense.value) ?? 0)}
        </p>
      </div>
      {children}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Link href={editLink}>{itemContent}</Link>
      ) : (
        <EditExpenseSheet expense={expense}>{itemContent}</EditExpenseSheet>
      )}
    </>
  );
}
