import AddCashRegister from "@/app/_components/dialogs/add/add-cash-register";
import { Button } from "@/components/ui/button";
import { listCashRegisters } from "@/server/queries/cash-register-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import CashRegisterList from "@/app/_components/lists/cash-register-list";

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ date: string }>;
}) {
  const { date } = await searchParams;
  const cashRegisters = listCashRegisters(date);

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none">
        <div className="hidden sm:block">
          <AddCashRegister>
            <Button className="rounded-full">Adicionar Caixa</Button>
          </AddCashRegister>
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <CashRegisterList cashRegisters={cashRegisters} />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <AddCashRegister>
          <Button className="h-12 w-full rounded-full">Adicionar Caixa</Button>
        </AddCashRegister>
      </div>
    </div>
  );
}
