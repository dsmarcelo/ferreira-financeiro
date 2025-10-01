"use client";

import { useActionState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { actionCreateProduct, type ActionResponse } from "@/actions/product-actions";

interface AddProductFormProps {
  id?: string;
  onSuccess?: () => void;
}

const initialState: ActionResponse = { success: false, message: "" };

export default function AddProductForm({ id, onSuccess }: AddProductFormProps) {
  const [state, formAction, pending] = useActionState<ActionResponse, FormData>(
    actionCreateProduct,
    initialState,
  );

  useEffect(() => {
    if (state.success === true && state.message) {
      toast.success(state.message);
      onSuccess?.();
    } else if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  const errors = state?.errors ?? {};

  return (
    <form id={id} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required placeholder="Nome do produto" />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cost">Custo</Label>
          <Input id="cost" name="cost" required type="number" step="0.01" min={0} />
          {errors.cost && (
            <p className="mt-1 text-sm text-red-500">{errors.cost[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço</Label>
          <Input id="price" name="price" required type="number" step="0.01" min={0} />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price[0]}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantidade</Label>
        <Input id="quantity" name="quantity" required type="number" min={0} />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-500">{errors.quantity[0]}</p>
        )}
      </div>
      {!id && (
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar Produto"}
        </Button>
      )}
    </form>
  );
}


