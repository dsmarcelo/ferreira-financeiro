import Link from "next/link";
import { MonthPicker } from "@/app/_components/date-picker";
import { sumCashRegisterByDateRange } from "@/server/queries/cash-register-queries";
import { formatCurrency } from "@/lib/utils";

interface SearchParams {
  from?: string;
  to?: string;
  [key: string]: string | string[] | undefined; // Fallback for other dynamic keys
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const from = params.from;
  const to = params.to;

  // if (!from || !to) {
  //   return <div>Link inválido, reinicie a página</div>;
  // }
  let cashRegister = 0;
  if (from && to) {
    cashRegister = await sumCashRegisterByDateRange(from, to);
  }

  return (
    <main className="">
      <MonthPicker />
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
              href="/caixa"
              className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
            >
              <p className="text-sm md:text-base">Despesas pessoais</p>
              <p className="text-lg font-semibold">R$ 10.000,00</p>
            </Link>
            <Link
              href="/despesas-da-loja"
              className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
            >
              <p className="text-sm md:text-base">Despesas da Loja</p>
              <p className="text-lg font-semibold">R$ 10.000,00</p>
            </Link>
          </div>
          <Link
            href="/despesas-de-produtos"
            className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
          >
            <p className="text-sm md:text-base">Despesas de Produtos</p>
            <p className="text-lg font-semibold">R$ 10.000,00</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
