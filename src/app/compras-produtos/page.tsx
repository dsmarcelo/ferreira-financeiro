import { getExpensesByPeriod } from "@/server/queries/expense-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import ExpensesList from "@/app/_components/lists/expenses-list";
import AddProductPurchase from "@/app/_components/dialogs/add/add-product-purchase";
import { Button } from "@/components/ui/button";

export default async function ComprasProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await searchParams;
  const expensesPromise = getExpensesByPeriod({
    start: from,
    end: to,
    source: "product_purchase",
  });
  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none">
        <div className="hidden sm:block">
          <AddProductPurchase />
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <ExpensesList expensesPromise={expensesPromise} />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <AddProductPurchase>
          <Button className="h-12 w-full rounded-full">
            Adicionar Compra de Produtos
          </Button>
        </AddProductPurchase>
      </div>
    </div>
  );
}
