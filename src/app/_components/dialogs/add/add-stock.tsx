"use client";

import { useEffect, useMemo, useState } from "react";
import ResponsiveDialog from "@/app/_components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { actionIncrementStock, type IncrementStockResponse } from "@/actions/stock-actions";
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
  const [state, formAction] = useActionState<IncrementStockResponse, FormData>(
    actionIncrementStock,
    { success: false, message: "" },
  );

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      const value = Number(amount);
      if (onAdded && isFinite(value) && value > 0) onAdded(value);
      toast.success("Estoque adicionado");
      setOpen(false);
      setAmount("");
    } else if (state.message) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success, state?.message]);

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
    void formAction(fd);
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Adicionar</Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}


