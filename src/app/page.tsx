import AddCashRegister from "./_components/dialogs/add-cash-register";
import Header from "./_components/header";
import SummaryCards from "@/app/_components/summary-cards";

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
      <Header showBackButton={false}>
        <h3 className="text-xl font-semibold">Prime Embalagens</h3>
      </Header>
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
        <AddCashRegister />
      </div>
    </main>
  );
}
