"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { Expense } from "@/server/db/schema/expense-schema";
import * as React from "react";
import EditExpenseSheet from "../sheets/edit-expense-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";

export interface ExpenseListItemProps {
  expense: Expense;
  onTogglePaid: (id: number, checked: boolean, date: string, index: number) => void;
  children?: React.ReactNode;
  index: number;
  date: string;
}

export function ExpenseListItem({
  expense,
  onTogglePaid,
  children,
  index,
  date,
}: ExpenseListItemProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const editLink = `/editar-despesa/${expense.id}`;

  // Only the checkbox toggles paid, the rest opens the sheet
  // Use EditExpenseSheet with custom trigger
  // SheetTrigger wraps the content except the checkbox
  // Children are preserved
  const itemContent = (
    <div
      className={cn(
        "relative hover:bg-background-secondary active:bg-accent flex w-full items-center gap-2 px-2 rounded-lg",
        expense.isPaid && "border-green-500 border",
        !expense.isPaid && expense.date < new Date().toISOString() && "border-red-400 border",
      )}
    >
      <div className="flex w-full items-center gap-2 py-2">
        <Checkbox
          className="h-6 w-6 active:bg-slate-500"
          checked={expense.isPaid}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePaid(expense.id, !expense.isPaid, date, index);
          }}
          onCheckedChange={(checked) => {
            onTogglePaid(expense.id, checked as boolean, date, index);
          }}
        />
        <div className="flex-1 break-words">
          <p>{expense.description}</p>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="outline" className="text-xs">
              {expense.category.name}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end -space-y-1">
        {expense.isPaid && (
          <span className="text-green-600 font-light text-xs">Pago</span>
        )}
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
