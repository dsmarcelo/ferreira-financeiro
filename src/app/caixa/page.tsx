export const revalidate = 0;
export const dynamic = "force-dynamic";
import AddCashRegister from "@/app/_components/dialogs/add-cash-register";
import { listCashRegisters } from "@/server/queries/cash-register-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import CashRegisterList from "@/app/_components/lists/cash-register-list";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[]; to?: string | string[] }>;
}) {
  // Compute default month start and end (YYYY-MM-DD)
  const today = new Date();
  const defaultStart = format(startOfMonth(today), "yyyy-MM-dd");
  const defaultEnd = format(endOfMonth(today), "yyyy-MM-dd");
  // Handle searchParams.from/to possibly string[]
  const rawFrom = (await searchParams).from;
  const rawTo = (await searchParams).to;
  const fromParam = Array.isArray(rawFrom) ? rawFrom[0] : rawFrom;
  const toParam = Array.isArray(rawTo) ? rawTo[0] : rawTo;
  // Determine the month range
  const monthStart = fromParam ?? defaultStart;
  const monthEnd = toParam ?? defaultEnd;
  // Fetch cash register entries within the selected month
  const cashRegisters = listCashRegisters(monthStart, monthEnd);
  // Derive year and month strings with fallbacks
  const defaultParts = defaultStart.split("-");
  const defaultYear = defaultParts[0] ?? "2024";
  const defaultMonth = defaultParts[1] ?? "01";
  const parts = monthStart.split("-");
  const yearStr = parts[0] ?? defaultYear;
  const monthStr = parts[1] ?? defaultMonth;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

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
          <CashRegisterList
            key={monthStart}
            cashRegisters={cashRegisters}
            year={year}
            month={month}
          />
        </Suspense>
      </main>
      <div className="block w-full flex-none px-5 sm:hidden">
        <AddCashRegister className="w-full" />
      </div>
    </div>
  );
}
