import AddCashRegister from "@/app/_components/dialogs/add-cash-register";
import { listCashRegisters } from "@/server/queries/cash-register-queries";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Header from "../_components/header";
import { DatePicker } from "@/app/_components/date-picker";
import { ptBR } from "date-fns/locale";
import EditCashRegister from "@/app/_components/dialogs/edit-cash-register";

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const cashRegisters = await listCashRegisters(date);
  return (
    <div className="flex min-h-screen flex-col pb-5">
      <div>
        <Header className="flex-none">
          <div className="hidden sm:block">
            <AddCashRegister />
          </div>
          <div className="sm:hidden"></div>
        </Header>
        <DatePicker />
      </div>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <div className="mx-auto w-full divide-y">
          {cashRegisters.map((cashRegister) => (
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
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddCashRegister className="w-full" />
      </div>
    </div>
  );
}
