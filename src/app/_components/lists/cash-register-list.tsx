import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditCashRegister from "../dialogs/edit/edit-cash-register";
import { formatCurrency } from "@/lib/utils";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { use } from "react";

// Helper to group cash registers by date string (YYYY-MM-DD)
function groupByDate(cashRegisters: CashRegister[]) {
  return cashRegisters.reduce<Record<string, CashRegister[]>>(
    (acc, cashRegister) => {
      const date = cashRegister.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(cashRegister);
      return acc;
    },
    {},
  );
}

/**
 * Renders a list of cash register entries.
 * Uses Suspense for loading states. Receives a promise of CashRegister[].
 */
export default function CashRegisterList({
  cashRegisters,
}: {
  cashRegisters: Promise<CashRegister[]>;
}) {
  const allCashRegisters = use(cashRegisters);
  const grouped = groupByDate(allCashRegisters);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="mx-auto w-full divide-y overflow-y-auto">
      {/* Iterate over each date group */}
      {sortedDates.map((date) => (
        <div key={date} className="py-1">
          {/* Date label, styled as in the image, no description */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <span className="w-12">
              {format(parseISO(date), "dd MMM", { locale: ptBR }).toUpperCase()}
            </span>
            <span className="flex-1" />
            <span className="min-w-[80px] text-right font-medium">
              {formatCurrency(grouped[date]?.[0]?.value ?? 0)}
            </span>
          </div>
          {/* Render additional values for this date, if any */}
          {(grouped[date]?.slice(1) ?? []).map((cashRegister) => (
            <EditCashRegister data={cashRegister} key={cashRegister.id}>
              <div className="text-muted-foreground flex items-center gap-2 pl-12 text-xs font-medium">
                <span className="flex-1" />
                <span className="min-w-[80px] text-right font-medium">
                  {formatCurrency(cashRegister.value)}
                </span>
              </div>
            </EditCashRegister>
          ))}
        </div>
      ))}
    </div>
  );
}
