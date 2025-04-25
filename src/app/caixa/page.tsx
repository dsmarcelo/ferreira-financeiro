import AddCashRegister from "@/app/_components/add-cash-register";
import { listCashRegisters } from "@/server/queries/cash-register-queries";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import Header from "../_components/header";
import { DatePicker } from "@/app/_components/date-picker";
import { ptBR } from "date-fns/locale";

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const cashRegisters = await listCashRegisters(date);
  return (
    <div className="flex min-h-screen flex-col pb-5">
      <Header className="flex-none">
        <div className="hidden sm:block">
          <AddCashRegister />
        </div>
      </Header>
      <DatePicker />
      <main className="h-fullflex container mx-auto max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <div className="mx-auto w-full divide-y">
          {cashRegisters.map((cashRegister) => (
            <div
              key={cashRegister.id}
              className="flex justify-between gap-4 py-2"
            >
              <p>{format(cashRegister.date, "dd/MM", { locale: ptBR })}</p>
              <p>{formatCurrency(cashRegister.value)}</p>
            </div>
          ))}
        </div>
      </main>
      <div className="block w-full px-5 sm:hidden">
        <AddCashRegister className="w-full" />
      </div>
    </div>
  );
}
