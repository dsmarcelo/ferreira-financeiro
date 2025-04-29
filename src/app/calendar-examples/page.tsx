import CashRegisterCalendar from "../_components/calendar/cash-register-calendar";
import StoreExpenseCalendar from "../_components/calendar/store-expense-calendar";
import { DateRangePicker } from "../_components/date-picker";
import { getYearAndMonthFromDateString } from "@/lib/date-utils";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Calendar Examples Page - Showcases different calendar implementations using the generic calendar framework
 */
export default function CalendarExamplesPage({ searchParams }: PageProps) {
  // Get year and month from the 'from' parameter, or use current date
  const { year, month } = getYearAndMonthFromDateString(searchParams.from as string | null);

  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Exemplos de Calendários</h1>

      {/* Date picker for navigation */}
      <div className="mb-8">
        <DateRangePicker />
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Caixa Diário</h2>
        <p className="mb-4 text-gray-600">
          Este calendário mostra os valores do caixa diário. Clique em um dia para
          adicionar ou editar um valor.
        </p>
        <CashRegisterCalendar
          year={year}
          month={month}
          searchParams={searchParams}
          className="rounded-lg shadow-md"
        />
      </div>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Despesas da Loja</h2>
        <p className="mb-4 text-gray-600">
          Este calendário mostra as despesas da loja. O símbolo ✓ indica despesas pagas
          e ! indica despesas pendentes. Clique em um dia para adicionar ou editar.
        </p>
        <StoreExpenseCalendar
          year={year}
          month={month}
          searchParams={searchParams}
          className="rounded-lg shadow-md"
        />
      </div>
    </main>
  );
}