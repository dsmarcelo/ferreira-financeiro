"use client";

import { useEffect, useState } from "react";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UniquePaymentForm } from "./unique-payment-form";
import { RecurringExpenseForm } from "./recurring-expense-form";
import { InstallmentExpenseForm } from "./installment-expense-form";

const initialState: {
  success: boolean;
  message: string;
  errors: Partial<Record<keyof ExpenseInsert, string[]>>;
} = {
  success: false,
  message: "",
  errors: {},
};

export default function AddExpenseForm({
  source,
  onSuccess,
  id,
}: {
  source: ExpenseInsert["source"];
  onSuccess?: () => void;
  id?: string;
}) {
  const [state, setState] = useState(initialState);
  const [expenseType, setExpenseType] =
    useState<ExpenseInsert["type"]>("one_time");

  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      onSuccess?.();
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);

  let title = "";
  switch (source) {
    case "personal":
      title = "Adicionar Despesa Pessoal";
      break;
    case "store":
      title = "Adicionar Despesa da Loja";
      break;
    case "product_purchase":
      title = "Adicionar Compra de Produto";
      break;
    default:
      title = "Adicionar Despesa";
      break;
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  return (
    <div className="mx-auto max-w-screen-md">
      {/* <p className="text-center mb-4 text-xl font-bold">{title}</p> */}
      <Tabs defaultValue={expenseType} className="w-full px-4">
        <TabsList className="mx-auto w-full">
          <TabsTrigger
            value="one_time"
            onClick={() => setExpenseType("one_time")}
          >
            Única
          </TabsTrigger>
          <TabsTrigger
            value="installment"
            onClick={() => setExpenseType("installment")}
          >
            Parcelada
          </TabsTrigger>
          <TabsTrigger
            value="recurring"
            onClick={() => setExpenseType("recurring")}
          >
            Recorrente
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one_time">
          <UniquePaymentForm
            id={id}
            source={source}
            description={description}
            amount={amount}
            onSuccess={onSuccess}
            handleDescriptionChange={handleDescriptionChange}
            handleAmountChange={handleAmountChange}
          />
        </TabsContent>
        <TabsContent value="installment">
          <InstallmentExpenseForm
            id={id}
            source={source}
            description={description}
            amount={amount}
            onSuccess={onSuccess}
            handleDescriptionChange={handleDescriptionChange}
            handleAmountChange={handleAmountChange}
          />
        </TabsContent>
        <TabsContent value="recurring">
          <RecurringExpenseForm
            id={id}
            source={source}
            description={description}
            amount={amount}
            onSuccess={onSuccess}
            handleDescriptionChange={handleDescriptionChange}
            handleAmountChange={handleAmountChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
