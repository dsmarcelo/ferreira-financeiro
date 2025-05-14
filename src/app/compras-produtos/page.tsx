import { Button } from "@/components/ui/button";
import { getExpensesByPeriod } from "@/server/queries/expense-queries";
import Header from "../_components/header";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import ExpensesList from "@/app/_components/lists/expenses-list";
import Link from "next/link";
import AddExpenseSheet from "../_components/sheets/add-expense-sheet";

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
          {/* <Link href="/compras-produtos/adicionar">
            <Button>Adicionar Compra de Produto</Button>
          </Link> */}
          <AddExpenseSheet source="product_purchase" />
        </div>
      </Header>
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-5">
        <Suspense fallback={<Loading />}>
          <ExpensesList expensesPromise={expensesPromise} />
        </Suspense>
      </main>
      <div className="fixed bottom-24 block w-full px-5 sm:hidden">
        <Link href="/compras-produtos/adicionar">
          <Button className="h-12 w-full rounded-full">
            Adicionar Compra de Produto
          </Button>
        </Link>
      </div>
    </div>
  );
}
