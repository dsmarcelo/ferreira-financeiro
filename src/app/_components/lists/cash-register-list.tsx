import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import EditCashRegister from "../dialogs/edit-cash-register";
import { formatCurrency } from "@/lib/utils";
import type { CashRegister } from "@/server/db/schema/cash-register";
import { use } from "react";

/**
 * Renders a list of cash register entries.
 * Uses Suspense for loading states. Receives a promise of CashRegister[].
 */
export default function CashRegisterList({
  cashRegisters,
}: {
  cashRegisters: Promise<CashRegister[]>;
}) {
  // Resolve the promise to get the data array
  const allCashRegisters = use(cashRegisters);

  return (
    <div className="mx-auto w-full divide-y overflow-y-auto">
      {allCashRegisters.map((cashRegister) => (
        <EditCashRegister data={cashRegister} key={cashRegister.id}>
          <div className="active:bg-accent flex cursor-pointer justify-between gap-4 py-2">
            <p>
              {format(parseISO(cashRegister.date), "dd MMM", {
                locale: ptBR,
              }).toUpperCase()}
            </p>
            <p>{formatCurrency(cashRegister.value)}</p>
          </div>
        </EditCashRegister>
      ))}
    </div>
  );
}
