"use client";

import { useActionState, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FieldError } from "./field-error";
import {
  createCategory,
  createCategoryWithoutRedirect,
  type ActionResponse,
} from "@/server/actions/category-actions";
import { CategoryColorSelector } from "../inputs/category-color-selector";
import { EmojiPicker } from "../inputs/emoji-picker";
import type { ExpenseCategory } from "@/server/db/schema/expense-category";

const initialState: ActionResponse = {
  message: "",
};

interface CreateCategoryFormProps {
  onSuccess?: (category: ExpenseCategory) => void;
  showCancelButton?: boolean;
}

export function CreateCategoryForm({
  onSuccess,
  showCancelButton = true,
}: CreateCategoryFormProps) {
  const [state, formAction, pending] = useActionState(
    (onSuccess ? createCategoryWithoutRedirect : createCategory) as (
      prevState: ActionResponse,
      formData: FormData,
    ) => Promise<ActionResponse>,
    initialState,
  );
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedEmoji, setSelectedEmoji] = useState("💸");

  // Handle successful category creation
  useEffect(() => {
    if (state?.success && state.category && onSuccess) {
      onSuccess(state.category as ExpenseCategory);
    }
  }, [state, onSuccess]);

  return (
    <div className={onSuccess ? "" : "mx-auto max-w-screen-md px-4"}>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Categoria</Label>
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="Digite o nome da categoria"
            required
            className="w-full"
          />
          <FieldError messages={state?.errors?.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <textarea
            id="description"
            name="description"
            placeholder="Digite uma descrição para a categoria"
            rows={2}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[40px] w-full rounded-md border px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <FieldError messages={state?.errors?.description} />
        </div>

        {/* TODO: Add a draggable list of categories in settings */}
        {/* <div className="space-y-2">
          <Label htmlFor="sortOrder">Ordem de Exibição</Label>
          <Input
            type="number"
            id="sortOrder"
            name="sortOrder"
            defaultValue="0"
            placeholder="0"
            min="0"
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Menor número aparece primeiro na lista
          </p>
          <FieldError messages={state?.errors?.sortOrder} />
        </div> */}

        <EmojiPicker
          selectedEmoji={selectedEmoji}
          onEmojiSelect={setSelectedEmoji}
          label="Ícone da Categoria"
          messages={state?.errors?.emoji}
        />

        <CategoryColorSelector
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          messages={state?.errors?.color}
        />

        {state?.message && (
          <p
            aria-live="polite"
            className={`text-sm ${state.success ? "text-green-600" : "text-red-600"}`}
          >
            {state.message}
          </p>
        )}

        <div className="flex gap-4">
          {showCancelButton && (
            <Button type="button" variant="outline" className="flex-1" asChild>
              <a href="/categorias">Cancelar</a>
            </Button>
          )}
          <Button
            type="submit"
            disabled={pending}
            className={showCancelButton ? "flex-1" : "w-full"}
          >
            {pending ? "Criando..." : "Criar Categoria"}
          </Button>
        </div>
      </form>
    </div>
  );
}
