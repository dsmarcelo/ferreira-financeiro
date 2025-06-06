import AddCashRegister from "./_components/dialogs/add/add-cash-register";
import AddPersonalExpense from "./_components/dialogs/add/add-personal-expense";
import AddStoreExpense from "./_components/dialogs/add/add-store-expense";
import AddProductPurchase from "./_components/dialogs/add/add-product-purchase";
import Header from "./_components/header";
import SummaryCards from "@/app/_components/summary-cards";
import { Button } from "@/components/ui/button";
import { SummaryPDFButton } from "@/app/_components/summary-pdf-button";
import ProfitText from "./_components/profit-text";
import { Suspense } from "react";

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
      <Header showBackButton={false} showLogoutButton={true} />
      <div className="container mx-auto flex max-w-screen-lg flex-col gap-4 p-5 pb-16">
        {/* Profit summary section */}
        {from && to ? (
          <>
            <Suspense
              fallback={
                <div className="bg-muted h-12 w-full animate-pulse rounded-lg" />
              }
            >
              <ProfitText from={from} to={to} />
            </Suspense>
            {/* Show summary cards and PDF button only if a period is selected */}
            {/* Summary cards for caixa, despesas pessoais, loja, produtos */}
            <SummaryCards from={from} to={to} />
            {/* Button to generate and download the summary PDF for the selected period */}
            <div className="mt-4">
              <SummaryPDFButton from={from} to={to} />
            </div>
          </>
        ) : (
          // Prompt to select a period if missing
          <div className="text-muted-foreground text-sm">
            Selecione um período para ver os dados.
          </div>
        )}
        {/* Buttons to add new entries for each type of financial record */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AddCashRegister>
            <Button className="h-14 rounded-xl w-full">Adicionar Caixa</Button>
          </AddCashRegister>
          <AddPersonalExpense>
            <Button className="h-14 rounded-xl w-full">
              Adicionar Despesa Pessoal
            </Button>
          </AddPersonalExpense>
          <AddStoreExpense>
            <Button className="h-14 rounded-xl w-full">
              Adicionar Despesa de Loja
            </Button>
          </AddStoreExpense>
          <AddProductPurchase>
            <Button className="h-14 rounded-xl w-full">
              Adicionar Compra de produto
            </Button>
          </AddProductPurchase>
        </div>
      </div>
    </main>
  );
}
