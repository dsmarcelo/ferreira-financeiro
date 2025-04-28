import Link from "next/link";
import { sumCashRegisterByDateRange } from "@/server/queries/cash-register-queries";
import { formatCurrency } from "@/lib/utils";
import AddCashRegister from "./_components/dialogs/add-cash-register";
import Header from "./_components/header";
import { DateRangePicker } from "./_components/date-picker";
import { sumPersonalExpenseByDateRange } from "@/server/queries/personal-expense-queries";
import { sumStoreExpenseByDateRange } from "@/server/queries/store-expense-queries";
import { sumProductPurchaseByDateRange } from "@/server/queries/product-purchase-queries";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const from = params.from;
  const to = params.to;

  // if (!from || !to) {
  //   return <div>Link inválido, reinicie a página</div>;
  // }
  let cashRegister = 0;
  let personalExpenses = 0;
  let storeExpenses = 0;
  let productPurchases = 0;
  if (from && to) {
    cashRegister = await sumCashRegisterByDateRange(from, to);
    personalExpenses = await sumPersonalExpenseByDateRange(from, to);
    storeExpenses = await sumStoreExpenseByDateRange(from, to);
    productPurchases = await sumProductPurchaseByDateRange(from, to);
  }

  return (
    <main className="">
      <DateRangePicker />
      <Header />
      <div className="container mx-auto flex max-w-screen-lg flex-col gap-4 p-5 pb-16">
        <div className="flex flex-col gap-4">
          <h5 className="text-xl font-bold">Lucro</h5>
          <h1 className="text-4xl font-bold">
            <span className="text-muted-foreground">R$</span> 32.540,50
          </h1>
        </div>
        <div className="container mx-auto flex max-w-screen-sm flex-col gap-4 leading-none">
          <Link
            href="/caixa"
            className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
          >
            <p className="">Caixa</p>
            <p className="text-lg font-semibold">
              {formatCurrency(cashRegister)}
            </p>
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/despesas-pessoais"
              className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
            >
              <p className="text-sm md:text-base">Despesas pessoais</p>
              <p className="text-lg font-semibold">
                {formatCurrency(personalExpenses)}
              </p>
            </Link>
            <Link
              href="/despesas-loja"
              className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
            >
              <p className="text-sm md:text-base">Despesas da Loja</p>
              <p className="text-lg font-semibold">
                {formatCurrency(storeExpenses)}
              </p>
            </Link>
          </div>
          <Link
            href="/compras-produtos"
            className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
          >
            <p className="text-sm md:text-base">Despesas de Produtos</p>
            <p className="text-lg font-semibold">
              {formatCurrency(productPurchases)}
            </p>
          </Link>
        </div>
        <AddCashRegister />
      </div>
    </main>
  );
}
