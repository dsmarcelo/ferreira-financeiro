import Link from "next/link";
import { MonthPicker } from "@/app/_components/date-picker";

export default function HomePage() {
  return (
    <main className="">
      <MonthPicker />
      <div className="container flex flex-col gap-4 p-5 pb-16">
        <div className="flex flex-col gap-4">
          <h5 className="text-xl font-bold">Lucro</h5>
          <h1 className="text-4xl font-bold">
            <span className="text-muted-foreground">R$</span> 32.540,50
          </h1>
        </div>
        <div className="flex flex-col gap-4 leading-none">
          <Link
            href="/caixa"
            className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
          >
            <p className="">Caixa</p>
            <p className="text-lg font-semibold">R$ 10.000,00</p>
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/caixa"
              className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
            >
              <p className="text-sm">Despesas pessoais</p>
              <p className="text-lg font-semibold">R$ 10.000,00</p>
            </Link>
            <Link
              href="/despesas-da-loja"
              className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
            >
              <p className="text-sm">Despesas da Loja</p>
              <p className="text-lg font-semibold">R$ 10.000,00</p>
            </Link>
          </div>
          <Link
            href="/despesas-de-produtos"
            className="bg-background-secondary flex flex-wrap items-center justify-between gap-2 rounded-lg p-4 py-3"
          >
            <p className="text-sm">Despesas de Produtos</p>
            <p className="text-lg font-semibold">R$ 10.000,00</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
