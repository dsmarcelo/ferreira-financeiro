import AddCashRegister from "./_components/dialogs/add/add-cash-register";
import AddPersonalExpense from "./_components/dialogs/add/add-personal-expense";
import AddStoreExpense from "./_components/dialogs/add/add-store-expense";
import AddProductPurchase from "./_components/dialogs/add/add-product-purchase";
import Header from "./_components/header";
import SummaryCards from "@/app/_components/summary-cards";
import { Button } from "@/components/ui/button";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  const params = await searchParams;
  const from = params.from;
  const to = params.to;

  return (
    <main className="">
      <Header showBackButton={false} />
      <div className="container mx-auto flex max-w-screen-lg flex-col gap-4 p-5 pb-16">
        <div className="flex flex-col gap-4">
          <h5 className="text-xl font-bold">Lucro</h5>
          {/* Optionally, you can show a placeholder or skeleton here if params are missing */}
          <h1 className="text-4xl font-bold">
            <span className="text-muted-foreground">R$</span> 32.540,50
          </h1>
        </div>
        {/* Conditionally render the summary cards only if both 'from' and 'to' are present */}
        {from && to ? (
          <SummaryCards from={from} to={to} />
        ) : (
          <div className="text-muted-foreground text-sm">
            Selecione um período para ver os dados.
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AddCashRegister>
            <Button className="h-14 rounded-xl">Adicionar Caixa</Button>
          </AddCashRegister>
          <AddPersonalExpense>
            <Button className="h-14 rounded-xl">
              Adicionar Despesa Pessoal
            </Button>
          </AddPersonalExpense>
          <AddStoreExpense>
            <Button className="h-14 rounded-xl">
              Adicionar Despesa de Loja
            </Button>
          </AddStoreExpense>
          <AddProductPurchase>
            <Button className="h-14 rounded-xl">
              Adicionar Despesa de Produto
            </Button>
          </AddProductPurchase>
        </div>
      </div>
    </main>
  );
}
