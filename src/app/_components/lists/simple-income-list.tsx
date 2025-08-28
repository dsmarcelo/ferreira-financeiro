"use client";

import { formatCurrency } from "@/lib/utils";
import type { Income } from "@/server/db/schema/incomes-schema";
import { use } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SimpleIncomeList({
  incomes,
}: {
  incomes: Promise<Income[]>;
}) {
  const allIncomes = use(incomes);

  if (allIncomes.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum resultado encontrado para o mês selecionado
      </div>
    );
  }

  return (
    <div className="divide-y">
      {allIncomes.map((income) => (
        <div key={income.id} className="flex items-center justify-between px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-base">{income.description}</p>
            <p className="text-muted-foreground text-sm">
              {format(parseISO(income.dateTime.toISOString()), "dd/MM, HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
          <div className="ml-4 text-right">
            <p className="font-semibold">{formatCurrency(Number(income.value))}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

