import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Prime Financeiro
        </h1>
        <Link href="/caixa">Caixa</Link>
        <Link href="/despesas-pessoais">Despesas Pessoais</Link>
        <Link href="/despesas-da-loja">Despesas da Loja</Link>
        <Link href="/despesas-de-produtos">Despesas de Produtos</Link>
      </div>
    </main>
  );
}
