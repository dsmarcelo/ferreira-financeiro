"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatCurrency } from "@/lib/utils";
import type { Expense } from "@/server/db/schema/expense-schema";
import * as React from "react";
import EditExpenseDialog from "../sheets/edit-expense-sheet";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { CategoryBadge } from "@/components/ui/category-badge";

export interface ExpenseListItemProps {
  expense: Expense;
  onTogglePaid: (
    id: number,
    checked: boolean,
    date: string,
    index: number,
  ) => void;
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

  const contentSection = (
    <>
      <div className="flex-1 break-words">
        <p>{expense.description}</p>
        <div className="mt-1 flex items-center gap-1">
          <CategoryBadge
            color={expense.category.color}
            name={expense.category.name}
            emoji={expense.category.emoji}
          />
        </div>
      </div>
      <div className="flex flex-col items-end -space-y-1">
        {expense.isPaid && (
          <span className="text-xs font-light text-green-600">Pago</span>
        )}
        <p className={cn("w-fit text-right whitespace-nowrap")}>
          {formatCurrency(Number(expense.value) ?? 0)}
        </p>
      </div>
      {children}
    </>
  );

  return (
    <div
      className={cn(
        "hover:bg-background-secondary active:bg-accent relative flex w-full items-center gap-2 rounded-lg px-2",
        expense.isPaid && "border border-green-500",
        !expense.isPaid &&
          expense.date < new Date().toISOString() &&
          "border border-red-400",
      )}
    >
      <div className="flex w-full items-center gap-2 py-2">
        <Checkbox
          className={cn(
            "h-8 w-8 rounded-full active:bg-slate-500",
            expense.isPaid && "bg-green-500",
          )}
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
        {isMobile ? (
          <Link
            href={editLink}
            className="flex flex-1 cursor-pointer items-center"
          >
            {contentSection}
          </Link>
        ) : (
          <EditExpenseDialog expense={expense}>
            <div className="flex flex-1 cursor-pointer items-center">
              {contentSection}
            </div>
          </EditExpenseDialog>
        )}
      </div>
    </div>
  );
}
