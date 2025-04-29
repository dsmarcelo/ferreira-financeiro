"use client";

import { useState } from "react";
import type { CashRegister } from "@/server/db/schema/cash-register";
import AddCashRegister from "../dialogs/add-cash-register";
import EditCashRegister from "../dialogs/edit-cash-register";
import { BigCalendar, buildCalendarDayData } from "./big-calendar";

interface CashRegisterCalendarClientProps {
  year: number;
  month: number; // 0-indexed
  cashRegisterByDate: Record<string, CashRegister[]>;
  className?: string;
}

/**
 * CashRegisterCalendarClient
 * Client-side calendar that supports multiple entries per day.
 */
export default function CashRegisterCalendarClient({
  year,
  month,
  cashRegisterByDate,
  className,
}: CashRegisterCalendarClientProps) {
  // Dialog state: list, edit, add, or none
  const [dialog, setDialog] = useState<
    | { type: "list"; date: string }
    | { type: "edit"; entry: CashRegister }
    | { type: "add"; date: string }
    | null
  >(null);

  // Called when a day is clicked
  const handleDayClick = (date: string, list: CashRegister[] | null) => {
    const entries = list || [];
    if (entries.length === 0) {
      setDialog({ type: "add", date });
    } else if (entries.length === 1) {
      setDialog({ type: "edit", entry: entries[0] });
    } else {
      setDialog({ type: "list", date });
    }
  };

  // Format label showing sum of values for the day
  const formatLabel = (_: string, list: CashRegister[] | null) => {
    const entries = list || [];
    if (entries.length === 0) return "+";
    const sum = entries.reduce((acc, e) => acc + Number(e.value), 0);
    return `R$ ${sum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  // Build dayData using generic helper
  const dayData = buildCalendarDayData<CashRegister[]>(
    year,
    month,
    cashRegisterByDate,
    formatLabel,
    handleDayClick
  );

  // Derive specific dialog variables
  const listDate = dialog?.type === "list" ? dialog.date : null;
  const editEntry = dialog?.type === "edit" ? dialog.entry : null;
  const addDate = dialog?.type === "add" ? dialog.date : null;

  return (
    <div className={className}>
      <BigCalendar year={year} month={month} dayData={dayData} />

      {/* List dialog: multiple entries */}
      {listDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-lg w-80">
            <h3 className="font-semibold mb-2">Entradas - {listDate}</h3>
            <div className="space-y-1 mb-4">
              {(cashRegisterByDate[listDate] || []).map((e) => (
                <button
                  key={e.id}
                  className="block w-full text-left p-2 hover:bg-gray-100"
                  onClick={() => setDialog({ type: "edit", entry: e })}
                >
                  R$ {Number(e.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </button>
              ))}
            </div>
            <button
              className="w-full mb-2 bg-blue-500 text-white py-2 rounded"
              onClick={() => setDialog({ type: "add", date: listDate })}
            >
              Adicionar
            </button>
            <button
              className="w-full py-2 text-gray-600"
              onClick={() => setDialog(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Edit dialog: single entry */}
      {editEntry && (
        <EditCashRegister
          data={editEntry}
          initialOpen={true}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
        >
          <span />
        </EditCashRegister>
      )}

      {/* Add dialog: add new entry */}
      {addDate && (
        <AddCashRegister
          key={`add-${addDate}`}
          defaultDate={addDate}
          initialOpen={true}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
        />
      )}
    </div>
  );
}
