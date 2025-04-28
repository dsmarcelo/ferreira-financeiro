import AddCashRegister from "@/app/_components/dialogs/add-cash-register";
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
    <div className="flex min-h-screen flex-col pb-5">
      <Header className="flex-none">
        <div className="hidden sm:block">
          <AddCashRegister />
        </div>
        <div className="sm:hidden"></div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <CashRegisterList cashRegisters={cashRegisters} />
        </Suspense>
      </main>
      <div className="block w-full flex-none px-5 sm:hidden">
        <AddCashRegister className="w-full" />
      </div>
    </div>
  );
}
