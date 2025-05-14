"use client";

import { useEffect, useState } from "react";
import type { ExpenseInsert } from "@/server/db/schema/expense-schema";

import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/inputs/currency-input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/app/_components/forms/field-error";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UniquePaymentForm } from "./unique-payment-form";
import { RecurringExpenseForm } from "./recurring-expense-form";
import { InstallmentExpenseForm } from "./installment-expense-form";
import { Button } from "@/components/ui/button";
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
  // Prop here to pass the info to the submit button
}: {
  source: ExpenseInsert["source"];
  onSuccess?: () => void;
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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const handleAmountChange = (value: number) => {
    setAmount(value);
  };

  const handleResetMainForm = () => {
    setDescription("");
    setAmount(0);
    setState(initialState);
  };

  return (
    <div className="mx-auto h-full w-full max-w-screen-md space-y-4">
      <Tabs defaultValue={expenseType} className="h-full w-full">
        <TabsList className="mx-auto mb-4">
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
        <TabsContent value="one_time" className="px-4">
          <UniquePaymentForm
            source="product_purchase"
            description={description}
            amount={amount}
            onSuccess={handleResetMainForm}
            handleDescriptionChange={handleDescriptionChange}
            handleAmountChange={handleAmountChange}
          />
        </TabsContent>
        <TabsContent value="installment" className="px-4">
          <InstallmentExpenseForm
            source={source}
            description={description}
            amount={amount}
            onSuccess={handleResetMainForm}
            handleDescriptionChange={handleDescriptionChange}
            handleAmountChange={handleAmountChange}
          />
        </TabsContent>
        <TabsContent value="recurring" className="px-4">
          <RecurringExpenseForm
            source="product_purchase"
            description={description}
            amount={amount}
            onSuccess={handleResetMainForm}
            handleDescriptionChange={handleDescriptionChange}
            handleAmountChange={handleAmountChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
