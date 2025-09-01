import AddIncome from "./_components/dialogs/add/add-income";
import AddPersonalExpense from "./_components/dialogs/add/add-personal-expense";
import AddStoreExpense from "./_components/dialogs/add/add-store-expense";
import Header from "./_components/header";
import SummaryCards from "@/app/_components/summary-cards";
import { Button } from "@/components/ui/button";
import { SummaryPDFButton } from "@/app/_components/summary-pdf-button";
import ProfitText from "./_components/profit-text";
import { Suspense } from "react";
import { User, Store, BanknoteArrowDown } from "lucide-react";

// Home page for the financial dashboard
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  // Get date range parameters from the URL (server-side)
  const params = await searchParams;
  const from = params.from;
  const to = params.to;

  return (
    <main className="">
      {/* Page header with optional back button */}
      <Header showBackButton={false} showUserMenu={true} />
      <div className="container mx-auto flex max-w-screen-lg flex-col gap-4 p-5 pb-16">
        {/* Profit summary section */}
        {from && to ? (
          <>
            <Suspense
              fallback={
                <div className="bg-muted h-12 w-full animate-pulse rounded-lg" />
              }
            >
              <div className="flex items-start justify-between gap-2">
                <ProfitText from={from} to={to} />
                <SummaryPDFButton from={from} to={to} />
              </div>
            </Suspense>
            {/* Show summary cards and PDF button only if a period is selected */}
            {/* Summary cards for caixa, despesas pessoais, loja, produtos */}
            <SummaryCards from={from} to={to} />
            {/* Button to generate and download the summary PDF for the selected period */}
            <div className="mt-4"></div>
          </>
        ) : (
          // Prompt to select a period if missing
          <div className="text-muted-foreground text-sm">
            Selecione um período para ver os dados.
          </div>
        )}
        {/* Buttons to add new entries for each type of financial record */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AddIncome>
            <Button className="h-14 w-full rounded-xl">
              <BanknoteArrowDown className="h-4 w-4" />
              <span>Adicionar Entrada</span>
            </Button>
          </AddIncome>
          <AddPersonalExpense>
            <Button className="h-14 w-full rounded-xl">
              <User className="h-4 w-4" />
              <span>Adicionar Despesa Pessoal</span>
            </Button>
          </AddPersonalExpense>
          <AddStoreExpense>
            <Button className="h-14 w-full rounded-xl">
              <Store className="h-4 w-4" />
              <span>Adicionar Despesa de Loja</span>
            </Button>
          </AddStoreExpense>
        </div>
      </div>
    </main>
  );
}
