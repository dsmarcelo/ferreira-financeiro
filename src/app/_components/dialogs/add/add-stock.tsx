"use client";

import { useMemo, useState, useTransition } from "react";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actionIncrementStock } from "@/actions/stock-actions";
import { toast } from "sonner";

export default function AddStockDialog({
  productId,
  productName,
  onAdded,
  children,
}: {
  productId: number;
  productName?: string;
  onAdded?: (amount: number) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  // Handle feedback inline after calling the server action to avoid unsafe types

  const trigger = useMemo(
    () => children ?? <Button variant="secondary">Adicionar estoque</Button>,
    [children],
  );

  const handleSubmit = () => {
    const numeric = Number(amount);
    if (!isFinite(numeric) || numeric <= 0) {
      toast.error("Informe uma quantidade válida (maior que zero)");
      return;
    }
    const fd = new FormData();
    fd.set("productId", String(productId));
    fd.set("amount", String(numeric));
    startTransition(async () => {
      const call = actionIncrementStock as unknown as (
        prevState: unknown,
        payload: FormData,
      ) => Promise<unknown>;
      const resultUnknown: unknown = await call(undefined, fd);
      const isResponse = (
        val: unknown,
      ): val is { success: boolean; message: string } => {
        if (typeof val !== "object" || val === null) return false;
        const maybe = val as { success?: unknown; message?: unknown };
        return (
          typeof maybe.success === "boolean" && typeof maybe.message === "string"
        );
      };

      if (isResponse(resultUnknown) && resultUnknown.success) {
        const value = Number(amount);
        if (onAdded && isFinite(value) && value > 0) onAdded(value);
        toast.success("Estoque adicionado");
        setOpen(false);
        setAmount("");
      } else if (isResponse(resultUnknown)) {
        toast.error(resultUnknown.message);
      } else {
        toast.error("Erro ao atualizar estoque");
      }
    });
  };

  return (
    <ResponsiveDialog
      triggerButton={trigger}
      title="Adicionar estoque"
      description={productName ? `Produto: ${productName}` : undefined}
      isOpen={open}
      onOpenChange={setOpen}
    >
      <div className="space-y-4 p-1">
        <div className="space-y-1">
          <label className="text-sm text-slate-600">Quantidade a adicionar</label>
          <Input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            placeholder="Ex: 5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending}>Adicionar</Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}


